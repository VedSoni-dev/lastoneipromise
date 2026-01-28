"""
Rule-Based Strategy Agents

Implements poker agents using traditional rule-based strategies:
- TAGBot: Tight-Aggressive (plays few hands, bets strong)
- LAGBot: Loose-Aggressive (plays many hands, bets often)
- NITBot: Ultra-Tight (only plays premium hands)

These agents use preflop charts, position awareness, and basic
postflop logic to make decisions.
"""

import random
from typing import Tuple, List, Optional, Dict, Set
from dataclasses import dataclass
from enum import IntEnum

from .base_agent import BaseAgent, HandResult
from ..card import Card, Rank
from ..actions import Action, LegalActions
from ..game_state import GameState, Street
from ..info_set import canonicalize_hole_cards
from ..hand_evaluator import evaluate_hand, hand_strength, HandRank


class HandCategory(IntEnum):
    """Categories of starting hands."""
    PREMIUM = 5      # AA, KK, QQ, AKs
    STRONG = 4       # JJ, TT, AK, AQs
    PLAYABLE = 3     # 99-77, AJ-AT, KQ
    SPECULATIVE = 2  # 66-22, suited connectors
    WEAK = 1         # Marginal hands
    TRASH = 0        # Unplayable


# Preflop hand rankings
HAND_RANKINGS: Dict[str, HandCategory] = {
    # Premium
    'AA': HandCategory.PREMIUM, 'KK': HandCategory.PREMIUM, 
    'QQ': HandCategory.PREMIUM, 'AKs': HandCategory.PREMIUM,
    
    # Strong
    'JJ': HandCategory.STRONG, 'TT': HandCategory.STRONG,
    'AKo': HandCategory.STRONG, 'AQs': HandCategory.STRONG,
    'AQo': HandCategory.STRONG, 'AJs': HandCategory.STRONG,
    'KQs': HandCategory.STRONG,
    
    # Playable
    '99': HandCategory.PLAYABLE, '88': HandCategory.PLAYABLE,
    '77': HandCategory.PLAYABLE, 'AJo': HandCategory.PLAYABLE,
    'ATs': HandCategory.PLAYABLE, 'ATo': HandCategory.PLAYABLE,
    'KQo': HandCategory.PLAYABLE, 'KJs': HandCategory.PLAYABLE,
    'QJs': HandCategory.PLAYABLE, 'JTs': HandCategory.PLAYABLE,
    
    # Speculative
    '66': HandCategory.SPECULATIVE, '55': HandCategory.SPECULATIVE,
    '44': HandCategory.SPECULATIVE, '33': HandCategory.SPECULATIVE,
    '22': HandCategory.SPECULATIVE, 'A9s': HandCategory.SPECULATIVE,
    'A8s': HandCategory.SPECULATIVE, 'A7s': HandCategory.SPECULATIVE,
    'A6s': HandCategory.SPECULATIVE, 'A5s': HandCategory.SPECULATIVE,
    'A4s': HandCategory.SPECULATIVE, 'A3s': HandCategory.SPECULATIVE,
    'A2s': HandCategory.SPECULATIVE, 'KJo': HandCategory.SPECULATIVE,
    'KTs': HandCategory.SPECULATIVE, 'QTs': HandCategory.SPECULATIVE,
    'T9s': HandCategory.SPECULATIVE, '98s': HandCategory.SPECULATIVE,
    '87s': HandCategory.SPECULATIVE, '76s': HandCategory.SPECULATIVE,
    '65s': HandCategory.SPECULATIVE, '54s': HandCategory.SPECULATIVE,
    
    # Weak (but sometimes playable)
    'A9o': HandCategory.WEAK, 'A8o': HandCategory.WEAK,
    'KTo': HandCategory.WEAK, 'QJo': HandCategory.WEAK,
    'JTo': HandCategory.WEAK, 'T9o': HandCategory.WEAK,
    '97s': HandCategory.WEAK, '86s': HandCategory.WEAK,
    '75s': HandCategory.WEAK, '64s': HandCategory.WEAK,
}


def get_hand_category(hole_cards: List[Card]) -> HandCategory:
    """Get the category for a starting hand."""
    canonical = canonicalize_hole_cards(hole_cards)
    return HAND_RANKINGS.get(canonical, HandCategory.TRASH)


def is_position_late(position: int, num_players: int) -> bool:
    """Check if position is late (button, cutoff)."""
    if num_players == 2:
        return position == 0  # Button in heads-up
    return position >= num_players - 2


def is_position_early(position: int, num_players: int) -> bool:
    """Check if position is early (UTG, UTG+1)."""
    if num_players == 2:
        return False
    return position <= 2


@dataclass
class PostflopStrength:
    """Categorize postflop hand strength."""
    category: str  # "monster", "strong", "marginal", "draw", "air"
    hand_rank: HandRank
    is_drawing: bool = False
    draw_outs: int = 0


def analyze_postflop_strength(
    hole_cards: List[Card], 
    community_cards: List[Card]
) -> PostflopStrength:
    """Analyze hand strength on the flop/turn/river."""
    if not community_cards:
        return PostflopStrength("unknown", HandRank.HIGH_CARD)
    
    all_cards = hole_cards + community_cards
    hand_value = evaluate_hand(all_cards)
    rank = hand_value.rank
    
    # Categorize based on hand rank
    if rank >= HandRank.STRAIGHT:
        return PostflopStrength("monster", rank)
    elif rank == HandRank.THREE_OF_A_KIND:
        return PostflopStrength("strong", rank)
    elif rank == HandRank.TWO_PAIR:
        return PostflopStrength("strong", rank)
    elif rank == HandRank.PAIR:
        # Check if it's top pair or better
        pair_rank = hand_value.kickers[0] if hand_value.kickers else 0
        board_ranks = sorted([c.rank.value for c in community_cards], reverse=True)
        
        if pair_rank >= board_ranks[0]:
            return PostflopStrength("strong", rank)
        elif pair_rank >= board_ranks[1] if len(board_ranks) > 1 else 0:
            return PostflopStrength("marginal", rank)
        else:
            return PostflopStrength("marginal", rank)
    
    # Check for draws (simplified)
    suits = [c.suit for c in all_cards]
    suit_counts = {}
    for s in suits:
        suit_counts[s] = suit_counts.get(s, 0) + 1
    
    has_flush_draw = any(c >= 4 for c in suit_counts.values())
    
    if has_flush_draw and len(community_cards) < 5:
        return PostflopStrength("draw", rank, is_drawing=True, draw_outs=9)
    
    return PostflopStrength("air", rank)


class TAGBot(BaseAgent):
    """
    Tight-Aggressive Bot
    
    Plays a solid, winning strategy:
    - Only plays strong starting hands
    - Raises with good hands, folds weak ones
    - Continuation bets on the flop
    - Value bets strong made hands
    """
    
    def __init__(self, name: str = "TAGBot", seed: Optional[int] = None):
        super().__init__()
        self._name = name
        self._rng = random.Random(seed)
        self._was_preflop_raiser = False
    
    @property
    def name(self) -> str:
        return self._name
    
    def on_hand_start(self, position: int, hole_cards: List[Card]) -> None:
        super().on_hand_start(position, hole_cards)
        self._was_preflop_raiser = False
    
    def _get_preflop_action(
        self, 
        game_state: GameState, 
        legal: LegalActions
    ) -> Tuple[Action, int]:
        """Decide preflop action."""
        category = get_hand_category(self._context.hole_cards)
        position = self._context.position
        num_players = game_state.num_players
        late_position = is_position_late(position, num_players)
        
        # Raise with premium/strong hands
        if category >= HandCategory.STRONG:
            self._was_preflop_raiser = True
            if legal.can_raise:
                # 3x raise
                raise_to = min(legal.max_raise, game_state.current_bet * 3 or game_state.config.big_blind * 3)
                return (Action.RAISE, max(legal.min_raise, raise_to))
            if legal.can_bet:
                return (Action.BET, max(legal.min_bet, game_state.config.big_blind * 3))
            return (Action.CALL, 0) if legal.can_call else (Action.CHECK, 0)
        
        # Play playable hands in position
        if category >= HandCategory.PLAYABLE and late_position:
            if legal.can_call:
                return (Action.CALL, legal.call_amount)
            return (Action.CHECK, 0) if legal.can_check else (Action.FOLD, 0)
        
        # Speculative hands only if cheap
        if category >= HandCategory.SPECULATIVE and late_position:
            if legal.can_check:
                return (Action.CHECK, 0)
            if legal.can_call and legal.call_amount <= game_state.config.big_blind * 2:
                return (Action.CALL, legal.call_amount)
        
        # Fold weak hands
        if legal.can_check:
            return (Action.CHECK, 0)
        return (Action.FOLD, 0)
    
    def _get_postflop_action(
        self, 
        game_state: GameState, 
        legal: LegalActions
    ) -> Tuple[Action, int]:
        """Decide postflop action."""
        strength = analyze_postflop_strength(
            self._context.hole_cards, 
            game_state.community_cards
        )
        
        pot = game_state.pot
        
        # Monster hands - bet/raise for value
        if strength.category == "monster":
            if legal.can_raise:
                return (Action.RAISE, min(legal.max_raise, pot))
            if legal.can_bet:
                bet_size = int(pot * 0.75)
                return (Action.BET, max(legal.min_bet, min(bet_size, legal.max_bet)))
            return (Action.CALL, 0) if legal.can_call else (Action.CHECK, 0)
        
        # Strong hands - bet for value
        if strength.category == "strong":
            if legal.can_bet:
                bet_size = int(pot * 0.6)
                return (Action.BET, max(legal.min_bet, min(bet_size, legal.max_bet)))
            if legal.can_call:
                return (Action.CALL, legal.call_amount)
            return (Action.CHECK, 0)
        
        # Marginal hands - check/call small bets
        if strength.category == "marginal":
            if legal.can_check:
                return (Action.CHECK, 0)
            if legal.can_call and legal.call_amount <= pot * 0.5:
                return (Action.CALL, legal.call_amount)
            return (Action.FOLD, 0)
        
        # Draws - bet/call if odds are right
        if strength.category == "draw":
            if legal.can_check:
                # Semi-bluff sometimes
                if self._rng.random() < 0.3 and legal.can_bet:
                    return (Action.BET, legal.min_bet)
                return (Action.CHECK, 0)
            if legal.can_call:
                # Call if pot odds are good
                pot_odds = pot / legal.call_amount if legal.call_amount > 0 else float('inf')
                if pot_odds >= 4:  # ~20% equity needed
                    return (Action.CALL, legal.call_amount)
            return (Action.FOLD, 0)
        
        # Air - check or fold, occasionally bluff
        if legal.can_check:
            # C-bet if we were preflop raiser
            if self._was_preflop_raiser and game_state.street == Street.FLOP:
                if legal.can_bet and self._rng.random() < 0.65:
                    bet_size = int(pot * 0.5)
                    return (Action.BET, max(legal.min_bet, min(bet_size, legal.max_bet)))
            return (Action.CHECK, 0)
        
        return (Action.FOLD, 0)
    
    def get_action(
        self, 
        game_state: GameState, 
        legal_actions: LegalActions
    ) -> Tuple[Action, int]:
        """Make a decision based on situation."""
        if game_state.street == Street.PREFLOP:
            return self._get_preflop_action(game_state, legal_actions)
        return self._get_postflop_action(game_state, legal_actions)


class LAGBot(BaseAgent):
    """
    Loose-Aggressive Bot
    
    Plays more hands than TAG but still aggressive:
    - Opens wider range of hands
    - Bluffs more frequently
    - 3-bets light
    - Applies maximum pressure
    """
    
    def __init__(self, name: str = "LAGBot", seed: Optional[int] = None):
        super().__init__()
        self._name = name
        self._rng = random.Random(seed)
    
    @property
    def name(self) -> str:
        return self._name
    
    def get_action(
        self, 
        game_state: GameState, 
        legal_actions: LegalActions
    ) -> Tuple[Action, int]:
        """Aggressive play style."""
        category = get_hand_category(self._context.hole_cards)
        pot = game_state.pot
        
        if game_state.street == Street.PREFLOP:
            # Open very wide
            if category >= HandCategory.WEAK or self._rng.random() < 0.3:
                if legal_actions.can_raise:
                    return (Action.RAISE, min(legal_actions.max_raise, game_state.config.big_blind * 3))
                if legal_actions.can_bet:
                    return (Action.BET, legal_actions.min_bet)
            if legal_actions.can_call:
                return (Action.CALL, legal_actions.call_amount)
            return (Action.CHECK, 0) if legal_actions.can_check else (Action.FOLD, 0)
        
        # Postflop - always bet if checked to us
        if legal_actions.can_bet:
            bet_size = int(pot * self._rng.uniform(0.5, 1.0))
            return (Action.BET, max(legal_actions.min_bet, min(bet_size, legal_actions.max_bet)))
        
        if legal_actions.can_raise and self._rng.random() < 0.4:
            return (Action.RAISE, legal_actions.min_raise)
        
        if legal_actions.can_call:
            return (Action.CALL, legal_actions.call_amount)
        
        return (Action.CHECK, 0) if legal_actions.can_check else (Action.FOLD, 0)


class NITBot(BaseAgent):
    """
    Ultra-Tight Bot (NIT)
    
    Only plays absolute premium hands:
    - AA, KK, QQ, AK only
    - Never bluffs
    - Folds to any resistance without the nuts
    """
    
    def __init__(self, name: str = "NITBot", seed: Optional[int] = None):
        super().__init__()
        self._name = name
        self._rng = random.Random(seed)
    
    @property
    def name(self) -> str:
        return self._name
    
    def get_action(
        self, 
        game_state: GameState, 
        legal_actions: LegalActions
    ) -> Tuple[Action, int]:
        """Ultra-tight play style."""
        category = get_hand_category(self._context.hole_cards)
        
        if game_state.street == Street.PREFLOP:
            # Only play premium
            if category >= HandCategory.PREMIUM:
                if legal_actions.can_raise:
                    return (Action.RAISE, legal_actions.min_raise)
                return (Action.CALL, 0) if legal_actions.can_call else (Action.CHECK, 0)
            
            if legal_actions.can_check:
                return (Action.CHECK, 0)
            return (Action.FOLD, 0)
        
        # Postflop - only continue with strong hands
        if self._context.hole_cards:
            strength = analyze_postflop_strength(
                self._context.hole_cards,
                game_state.community_cards
            )
            
            if strength.category in ("monster", "strong"):
                if legal_actions.can_bet:
                    return (Action.BET, legal_actions.min_bet)
                if legal_actions.can_call:
                    return (Action.CALL, legal_actions.call_amount)
                return (Action.CHECK, 0)
        
        if legal_actions.can_check:
            return (Action.CHECK, 0)
        return (Action.FOLD, 0)
