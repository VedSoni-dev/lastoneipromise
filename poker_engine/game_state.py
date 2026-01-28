"""
GameState - Tracks the complete state of a poker hand.
"""

from dataclasses import dataclass, field
from enum import IntEnum, auto
from typing import List, Optional, Dict, Any
import json

from .card import Card, Deck
from .player import PlayerState
from .actions import Action, PlayerAction, LegalActions


class Street(IntEnum):
    """Betting rounds in Texas Hold'em."""
    PREFLOP = 0
    FLOP = 1
    TURN = 2
    RIVER = 3
    SHOWDOWN = 4
    
    def __str__(self) -> str:
        return self.name.lower()


@dataclass
class GameConfig:
    """Configuration for a poker game."""
    small_blind: int = 10
    big_blind: int = 20
    ante: int = 0
    min_players: int = 2
    max_players: int = 9
    starting_stack: int = 1000
    min_raise_multiplier: float = 2.0
    
    def to_dict(self) -> dict:
        return {
            'small_blind': self.small_blind,
            'big_blind': self.big_blind,
            'ante': self.ante,
            'min_players': self.min_players,
            'max_players': self.max_players,
            'starting_stack': self.starting_stack,
        }


@dataclass
class GameState:
    """
    Complete state of a poker hand.
    
    Tracks all players, cards, bets, and game progress.
    Provides methods for getting legal actions and JSON serialization.
    """
    players: List[PlayerState]
    community_cards: List[Card] = field(default_factory=list)
    pot: int = 0
    current_bet: int = 0
    street: Street = Street.PREFLOP
    button_position: int = 0
    current_player_idx: int = 0
    min_raise: int = 0
    last_raiser_idx: Optional[int] = None
    hand_number: int = 0
    config: GameConfig = field(default_factory=GameConfig)
    
    # Track actions this street for betting round logic
    actions_this_street: List[PlayerAction] = field(default_factory=list)
    
    @property
    def current_player(self) -> Optional[PlayerState]:
        """Get the current player to act."""
        if 0 <= self.current_player_idx < len(self.players):
            return self.players[self.current_player_idx]
        return None
    
    @property
    def num_players(self) -> int:
        return len(self.players)
    
    @property
    def active_players(self) -> List[PlayerState]:
        """Players who haven't folded."""
        return [p for p in self.players if p.is_in_hand]
    
    @property
    def players_can_act(self) -> List[PlayerState]:
        """Players who can still take action (not folded, not all-in)."""
        return [p for p in self.players if p.is_active]
    
    @property
    def small_blind_position(self) -> int:
        """Position of small blind (left of button)."""
        if self.num_players == 2:
            return self.button_position  # Heads-up: button posts SB
        return (self.button_position + 1) % self.num_players
    
    @property
    def big_blind_position(self) -> int:
        """Position of big blind."""
        if self.num_players == 2:
            return (self.button_position + 1) % 2  # Heads-up: other player is BB
        return (self.button_position + 2) % self.num_players
    
    def get_player(self, player_id: int) -> Optional[PlayerState]:
        """Get player by ID."""
        for p in self.players:
            if p.player_id == player_id:
                return p
        return None
    
    def get_player_position(self, player_id: int) -> Optional[int]:
        """Get index of player in players list."""
        for i, p in enumerate(self.players):
            if p.player_id == player_id:
                return i
        return None
    
    def get_legal_actions(self, player_idx: Optional[int] = None) -> LegalActions:
        """
        Get legal actions for a player.
        
        Args:
            player_idx: Player index, defaults to current player.
            
        Returns:
            LegalActions with available moves and bet sizes.
        """
        if player_idx is None:
            player_idx = self.current_player_idx
        
        if player_idx < 0 or player_idx >= len(self.players):
            return LegalActions(can_fold=False)
        
        player = self.players[player_idx]
        
        if player.folded or player.is_all_in:
            return LegalActions(can_fold=False)
        
        amount_to_call = self.current_bet - player.current_bet
        
        legal = LegalActions()
        legal.can_fold = True
        legal.can_check = (amount_to_call == 0)
        legal.call_amount = min(amount_to_call, player.stack) if amount_to_call > 0 else 0
        legal.all_in_amount = player.stack
        
        # Determine if we can bet or raise
        if self.current_bet == 0:
            # No bet yet - can bet
            legal.min_bet = self.config.big_blind
            legal.max_bet = player.stack
        else:
            # There's a bet - can raise
            # Minimum raise is the size of the last raise (or big blind)
            min_raise_size = max(self.min_raise, self.config.big_blind)
            legal.min_raise = self.current_bet + min_raise_size
            legal.max_raise = player.current_bet + player.stack
            
            # Can only raise if we have enough chips
            if legal.min_raise > legal.max_raise:
                legal.min_raise = 0
                legal.max_raise = 0
        
        return legal
    
    def is_betting_complete(self) -> bool:
        """Check if all players have acted and bets are equal."""
        active = self.active_players
        
        if len(active) <= 1:
            return True
        
        can_act = [p for p in active if not p.is_all_in]
        if not can_act:
            return True
        
        # Check if everyone has matched the current bet
        for player in can_act:
            if player.current_bet < self.current_bet:
                return False
        
        # Check if we've gone around at least once
        if not self.actions_this_street:
            return False
        
        # After last raiser, everyone must have acted
        if self.last_raiser_idx is not None:
            # Find actions after last raise
            last_raise_action_idx = -1
            for i, action in enumerate(self.actions_this_street):
                if action.action in (Action.RAISE, Action.BET):
                    last_raise_action_idx = i
            
            if last_raise_action_idx >= 0:
                actions_after_raise = self.actions_this_street[last_raise_action_idx + 1:]
                players_acted = {a.player_id for a in actions_after_raise}
                
                for player in can_act:
                    if player.player_id not in players_acted and player.player_id != self.players[self.last_raiser_idx].player_id:
                        return False
        
        return True
    
    def is_hand_complete(self) -> bool:
        """Check if the hand is over."""
        if self.street == Street.SHOWDOWN:
            return True
        if len(self.active_players) <= 1:
            return True
        return False
    
    def next_active_player(self, from_idx: int) -> Optional[int]:
        """Find the next player who can act."""
        for i in range(1, self.num_players + 1):
            idx = (from_idx + i) % self.num_players
            if self.players[idx].is_active:
                return idx
        return None
    
    def to_dict(self, viewer_id: Optional[int] = None) -> dict:
        """
        Serialize game state to dictionary.
        
        Args:
            viewer_id: If provided, hide other players' hole cards.
        """
        return {
            'players': [
                p.to_dict(hide_cards=(viewer_id is not None and p.player_id != viewer_id))
                for p in self.players
            ],
            'community_cards': [c.to_dict() for c in self.community_cards],
            'pot': self.pot,
            'current_bet': self.current_bet,
            'street': self.street.name,
            'button_position': self.button_position,
            'current_player_idx': self.current_player_idx,
            'min_raise': self.min_raise,
            'hand_number': self.hand_number,
            'config': self.config.to_dict(),
        }
    
    def to_json(self, viewer_id: Optional[int] = None) -> str:
        """Serialize to JSON string."""
        return json.dumps(self.to_dict(viewer_id))
    
    @classmethod
    def from_dict(cls, data: dict) -> 'GameState':
        """Deserialize from dictionary."""
        config = GameConfig(**data.get('config', {}))
        
        state = cls(
            players=[PlayerState.from_dict(p) for p in data['players']],
            community_cards=[Card.from_dict(c) for c in data.get('community_cards', [])],
            pot=data.get('pot', 0),
            current_bet=data.get('current_bet', 0),
            street=Street[data.get('street', 'PREFLOP')],
            button_position=data.get('button_position', 0),
            current_player_idx=data.get('current_player_idx', 0),
            min_raise=data.get('min_raise', 0),
            hand_number=data.get('hand_number', 0),
            config=config,
        )
        
        return state
    
    @classmethod
    def from_json(cls, json_str: str) -> 'GameState':
        """Deserialize from JSON string."""
        return cls.from_dict(json.loads(json_str))
    
    def copy(self) -> 'GameState':
        """Create a deep copy of the state."""
        return GameState.from_dict(self.to_dict())
    
    def __repr__(self) -> str:
        active = len(self.active_players)
        cards = ' '.join(str(c) for c in self.community_cards) if self.community_cards else "None"
        return f"GameState(hand={self.hand_number}, street={self.street}, pot={self.pot}, active={active}, board=[{cards}])"
