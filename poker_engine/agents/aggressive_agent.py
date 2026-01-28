"""
Aggressive Agent

An agent that always tries to bet or raise.
Useful for testing fold strategies and as an aggressive baseline.
"""

import random
from typing import Tuple, Optional

from .base_agent import BaseAgent
from ..actions import Action, LegalActions
from ..game_state import GameState


class AggressiveAgent(BaseAgent):
    """
    Agent that always bets/raises when possible.
    
    Embodies hyper-aggressive play style - never checks,
    always puts pressure on opponents.
    
    Useful for:
    - Testing fold strategies
    - Pressuring passive opponents
    - Aggressive baseline
    
    Args:
        name: Agent name.
        bet_sizing: Bet size as fraction of pot (default 0.75).
        seed: Random seed.
    """
    
    def __init__(
        self, 
        name: str = "AggroBot",
        bet_sizing: float = 0.75,
        seed: Optional[int] = None
    ):
        super().__init__()
        self._name = name
        self._bet_sizing = bet_sizing
        self._rng = random.Random(seed)
    
    @property
    def name(self) -> str:
        return self._name
    
    def _calculate_bet_amount(
        self, 
        pot: int, 
        min_amount: int, 
        max_amount: int
    ) -> int:
        """Calculate bet size based on pot."""
        target = int(pot * self._bet_sizing)
        # Add some randomness
        target = int(target * self._rng.uniform(0.8, 1.2))
        return max(min_amount, min(target, max_amount))
    
    def get_action(
        self, 
        game_state: GameState, 
        legal_actions: LegalActions
    ) -> Tuple[Action, int]:
        """Always bet or raise if possible."""
        
        pot = game_state.pot
        
        # Prefer raising
        if legal_actions.can_raise:
            amount = self._calculate_bet_amount(
                pot,
                legal_actions.min_raise,
                legal_actions.max_raise
            )
            return (Action.RAISE, amount)
        
        # Otherwise bet
        if legal_actions.can_bet:
            amount = self._calculate_bet_amount(
                pot,
                legal_actions.min_bet,
                legal_actions.max_bet
            )
            return (Action.BET, amount)
        
        # If we can't bet/raise, all-in
        if legal_actions.can_all_in:
            return (Action.ALL_IN, legal_actions.all_in_amount)
        
        # Call if we must
        if legal_actions.can_call:
            return (Action.CALL, legal_actions.call_amount)
        
        # Check if available
        if legal_actions.can_check:
            return (Action.CHECK, 0)
        
        return (Action.FOLD, 0)


class ManiacAgent(BaseAgent):
    """
    Extremely aggressive agent that frequently goes all-in.
    
    Represents the most extreme aggressive strategy.
    """
    
    def __init__(
        self, 
        name: str = "Maniac",
        all_in_frequency: float = 0.3,
        seed: Optional[int] = None
    ):
        super().__init__()
        self._name = name
        self._all_in_freq = all_in_frequency
        self._rng = random.Random(seed)
    
    @property
    def name(self) -> str:
        return self._name
    
    def get_action(
        self, 
        game_state: GameState, 
        legal_actions: LegalActions
    ) -> Tuple[Action, int]:
        """Frequently go all-in, otherwise max bet/raise."""
        
        # Random all-in
        if legal_actions.can_all_in and self._rng.random() < self._all_in_freq:
            return (Action.ALL_IN, legal_actions.all_in_amount)
        
        # Max raise
        if legal_actions.can_raise:
            return (Action.RAISE, legal_actions.max_raise)
        
        # Max bet
        if legal_actions.can_bet:
            return (Action.BET, legal_actions.max_bet)
        
        # All-in
        if legal_actions.can_all_in:
            return (Action.ALL_IN, legal_actions.all_in_amount)
        
        # Call
        if legal_actions.can_call:
            return (Action.CALL, legal_actions.call_amount)
        
        if legal_actions.can_check:
            return (Action.CHECK, 0)
        
        return (Action.FOLD, 0)
