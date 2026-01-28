"""
Information Set and Abstraction Layer for Poker AI.

This module provides abstractions that make poker AI tractable by:
1. InfoSet: What a player actually knows (imperfect information)
2. Card Abstraction: Bucketing similar hands together
3. Action Abstraction: Discretizing bet sizes
4. History Abstraction: Compressing betting sequences
"""

from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional, Set
from enum import IntEnum
from functools import lru_cache
import hashlib

from .card import Card, Rank, Suit
from .player import PlayerState
from .game_state import GameState, Street
from .actions import Action, PlayerAction
from .hand_evaluator import hand_strength


# Preflop hand categories (169 canonical starting hands)
PREFLOP_HANDS = {
    # Pairs
    'AA': 0, 'KK': 1, 'QQ': 2, 'JJ': 3, 'TT': 4, '99': 5, '88': 6, '77': 7,
    '66': 8, '55': 9, '44': 10, '33': 11, '22': 12,
    # Suited hands (Ace-high)
    'AKs': 13, 'AQs': 14, 'AJs': 15, 'ATs': 16, 'A9s': 17, 'A8s': 18, 'A7s': 19,
    'A6s': 20, 'A5s': 21, 'A4s': 22, 'A3s': 23, 'A2s': 24,
    # Offsuit hands (Ace-high)
    'AKo': 25, 'AQo': 26, 'AJo': 27, 'ATo': 28, 'A9o': 29, 'A8o': 30, 'A7o': 31,
    'A6o': 32, 'A5o': 33, 'A4o': 34, 'A3o': 35, 'A2o': 36,
    # Continue for other hands...
}


def canonicalize_hole_cards(cards: List[Card]) -> str:
    """
    Convert hole cards to canonical form (e.g., 'AKs', 'QJo', 'TT').
    
    Args:
        cards: Two hole cards.
        
    Returns:
        Canonical hand string.
    """
    if len(cards) != 2:
        raise ValueError("Must have exactly 2 hole cards")
    
    c1, c2 = cards
    r1, r2 = c1.rank.value, c2.rank.value
    
    # Order by rank (higher first)
    if r1 < r2:
        r1, r2 = r2, r1
        c1, c2 = c2, c1
    
    # Rank symbols
    rank_symbols = {14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: 'T',
                    9: '9', 8: '8', 7: '7', 6: '6', 5: '5',
                    4: '4', 3: '3', 2: '2'}
    
    s1 = rank_symbols[r1]
    s2 = rank_symbols[r2]
    
    if r1 == r2:
        return f"{s1}{s2}"  # Pair
    elif c1.suit == c2.suit:
        return f"{s1}{s2}s"  # Suited
    else:
        return f"{s1}{s2}o"  # Offsuit


def get_preflop_bucket(cards: List[Card]) -> int:
    """
    Get bucket ID for preflop hand (0-168).
    
    Groups all 1326 starting hands into 169 categories.
    """
    canonical = canonicalize_hole_cards(cards)
    
    # Generate full mapping if needed
    rank_order = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
    bucket = 0
    bucket_map = {}
    
    # Pairs first
    for r in rank_order:
        bucket_map[f"{r}{r}"] = bucket
        bucket += 1
    
    # Suited then offsuit
    for i, r1 in enumerate(rank_order):
        for r2 in rank_order[i+1:]:
            bucket_map[f"{r1}{r2}s"] = bucket
            bucket += 1
            bucket_map[f"{r1}{r2}o"] = bucket
            bucket += 1
    
    return bucket_map.get(canonical, 0)


def get_equity_bucket(
    hole_cards: List[Card],
    community_cards: List[Card],
    num_buckets: int = 10,
    simulations: int = 200
) -> int:
    """
    Get equity bucket for postflop hand.
    
    Uses Monte Carlo simulation to estimate equity, then buckets it.
    
    Args:
        hole_cards: Player's hole cards.
        community_cards: Current community cards.
        num_buckets: Number of equity buckets (default 10 = 0-10%, 10-20%, etc.)
        simulations: Number of simulations for equity calculation.
        
    Returns:
        Bucket ID from 0 to num_buckets-1.
    """
    if not community_cards:
        # Preflop - use preflop buckets instead
        return get_preflop_bucket(hole_cards) % num_buckets
    
    equity = hand_strength(hole_cards, community_cards, num_opponents=1, simulations=simulations)
    bucket = int(equity * num_buckets)
    return min(bucket, num_buckets - 1)


class ActionBucket(IntEnum):
    """Discretized action buckets."""
    FOLD = 0
    CHECK_CALL = 1
    BET_HALF_POT = 2
    BET_POT = 3
    BET_2X_POT = 4
    ALL_IN = 5


def get_action_bucket(action: Action, amount: int, pot_size: int) -> ActionBucket:
    """
    Convert a specific action to an action bucket.
    
    Args:
        action: The action type.
        amount: Bet/raise amount.
        pot_size: Current pot size.
        
    Returns:
        ActionBucket category.
    """
    if action == Action.FOLD:
        return ActionBucket.FOLD
    
    if action in (Action.CHECK, Action.CALL):
        return ActionBucket.CHECK_CALL
    
    if action == Action.ALL_IN:
        return ActionBucket.ALL_IN
    
    # For bets and raises, categorize by pot ratio
    if pot_size <= 0:
        pot_size = 1  # Avoid division by zero
    
    ratio = amount / pot_size
    
    if ratio <= 0.3:
        return ActionBucket.CHECK_CALL  # Small bets are like calls
    elif ratio <= 0.75:
        return ActionBucket.BET_HALF_POT
    elif ratio <= 1.5:
        return ActionBucket.BET_POT
    elif ratio <= 3.0:
        return ActionBucket.BET_2X_POT
    else:
        return ActionBucket.ALL_IN


def get_history_abstraction(actions: List[PlayerAction], pot_sizes: List[int]) -> str:
    """
    Compress betting history to abstracted sequence.
    
    Converts specific bet amounts to categories for pattern matching.
    
    Args:
        actions: List of actions taken.
        pot_sizes: Pot size at each action.
        
    Returns:
        Abstracted history string like "x-r-c" (check-raise-call).
    """
    if not actions:
        return ""
    
    symbols = {
        ActionBucket.FOLD: 'f',
        ActionBucket.CHECK_CALL: 'x',
        ActionBucket.BET_HALF_POT: 'b',
        ActionBucket.BET_POT: 'r',
        ActionBucket.BET_2X_POT: 'R',
        ActionBucket.ALL_IN: 'A',
    }
    
    abstracted = []
    for i, action in enumerate(actions):
        pot = pot_sizes[i] if i < len(pot_sizes) else pot_sizes[-1] if pot_sizes else 1
        bucket = get_action_bucket(action.action, action.amount, pot)
        abstracted.append(symbols[bucket])
    
    return '-'.join(abstracted)


@dataclass
class InfoSet:
    """
    Information set - what a player knows about the game.
    
    This is the core abstraction for imperfect information games.
    A player cannot see opponent hole cards, only their own cards
    and the public information.
    """
    player_id: int
    hole_cards: List[Card]
    community_cards: List[Card]
    pot: int
    current_bet: int
    player_stack: int
    player_current_bet: int
    street: Street
    position: int  # Relative to button
    num_players: int
    active_players: int
    betting_history: List[PlayerAction] = field(default_factory=list)
    pot_history: List[int] = field(default_factory=list)
    
    # Precomputed abstractions
    _hand_bucket: Optional[int] = field(default=None, repr=False)
    _history_hash: Optional[str] = field(default=None, repr=False)
    
    @property
    def hand_bucket(self) -> int:
        """Get abstracted hand bucket."""
        if self._hand_bucket is None:
            if self.street == Street.PREFLOP:
                object.__setattr__(self, '_hand_bucket', get_preflop_bucket(self.hole_cards))
            else:
                object.__setattr__(self, '_hand_bucket', get_equity_bucket(self.hole_cards, self.community_cards))
        return self._hand_bucket
    
    @property
    def history_abstraction(self) -> str:
        """Get abstracted betting history."""
        return get_history_abstraction(self.betting_history, self.pot_history)
    
    @property
    def amount_to_call(self) -> int:
        """Amount needed to call current bet."""
        return max(0, self.current_bet - self.player_current_bet)
    
    @property
    def pot_odds(self) -> float:
        """Calculate pot odds for calling."""
        to_call = self.amount_to_call
        if to_call == 0:
            return float('inf')
        return self.pot / to_call
    
    @property
    def stack_to_pot_ratio(self) -> float:
        """Stack to pot ratio (SPR)."""
        if self.pot == 0:
            return float('inf')
        return self.player_stack / self.pot
    
    def get_key(self, num_buckets: int = 10) -> str:
        """
        Get a hashable key for this info set.
        
        Used for CFR strategy storage.
        """
        hand_b = self.hand_bucket % num_buckets
        history = self.history_abstraction
        return f"{self.street.name}:{hand_b}:{history}"
    
    def to_dict(self) -> dict:
        """Serialize to dictionary."""
        return {
            'player_id': self.player_id,
            'hole_cards': [c.to_dict() for c in self.hole_cards],
            'community_cards': [c.to_dict() for c in self.community_cards],
            'pot': self.pot,
            'current_bet': self.current_bet,
            'player_stack': self.player_stack,
            'player_current_bet': self.player_current_bet,
            'street': self.street.name,
            'position': self.position,
            'num_players': self.num_players,
            'active_players': self.active_players,
            'hand_bucket': self.hand_bucket,
            'history_abstraction': self.history_abstraction,
            'pot_odds': self.pot_odds if self.amount_to_call > 0 else None,
            'spr': self.stack_to_pot_ratio,
        }
    
    @classmethod
    def from_game_state(cls, state: GameState, player_id: int) -> 'InfoSet':
        """
        Create InfoSet from GameState for a specific player.
        
        Only includes information that player can see.
        """
        player = state.get_player(player_id)
        if player is None:
            raise ValueError(f"Player {player_id} not found in game state")
        
        # Calculate position relative to button
        player_idx = state.get_player_position(player_id)
        relative_position = (player_idx - state.button_position) % state.num_players
        
        return cls(
            player_id=player_id,
            hole_cards=player.hole_cards.copy(),
            community_cards=state.community_cards.copy(),
            pot=state.pot,
            current_bet=state.current_bet,
            player_stack=player.stack,
            player_current_bet=player.current_bet,
            street=state.street,
            position=relative_position,
            num_players=state.num_players,
            active_players=len(state.active_players),
            betting_history=[a for a in state.actions_this_street],
            pot_history=[state.pot] * len(state.actions_this_street),  # Simplified
        )


def get_hand_bucket(hole_cards: List[Card], community_cards: List[Card], num_buckets: int = 10) -> int:
    """
    Main API for hand abstraction.
    
    Returns a bucket ID representing similar hands.
    """
    if not community_cards:
        return get_preflop_bucket(hole_cards) % num_buckets
    return get_equity_bucket(hole_cards, community_cards, num_buckets)


def get_action_abstraction(action: Action, amount: int, pot_size: int) -> ActionBucket:
    """Main API for action abstraction."""
    return get_action_bucket(action, amount, pot_size)


def get_betting_sequence_abstraction(actions: List[PlayerAction], pot_sizes: List[int]) -> str:
    """Main API for history abstraction."""
    return get_history_abstraction(actions, pot_sizes)
