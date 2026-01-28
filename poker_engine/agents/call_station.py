"""
Call Station Agent

An agent that never folds - always checks or calls.
Useful as a baseline and for testing bluff strategies.
"""

from typing import Tuple

from .base_agent import BaseAgent
from ..actions import Action, LegalActions
from ..game_state import GameState


class CallStationAgent(BaseAgent):
    """
    Agent that never folds, always checks or calls.
    
    A "calling station" is poker slang for a player who calls
    too often and rarely folds. This agent embodies that extreme.
    
    Useful for:
    - Testing value betting strategies
    - Baseline that doesn't fold
    - Simple opponent for hand equity testing
    
    Args:
        name: Optional custom name.
    """
    
    def __init__(self, name: str = "CallStation"):
        super().__init__()
        self._name = name
    
    @property
    def name(self) -> str:
        return self._name
    
    def get_action(
        self, 
        game_state: GameState, 
        legal_actions: LegalActions
    ) -> Tuple[Action, int]:
        """Always check or call, never fold or raise."""
        
        # Prefer check if possible
        if legal_actions.can_check:
            return (Action.CHECK, 0)
        
        # Otherwise call
        if legal_actions.can_call:
            return (Action.CALL, legal_actions.call_amount)
        
        # If somehow we can't check or call, go all-in to not fold
        if legal_actions.can_all_in:
            return (Action.ALL_IN, legal_actions.all_in_amount)
        
        # Last resort - should never happen in normal play
        return (Action.FOLD, 0)


class NeverFoldAgent(BaseAgent):
    """
    Similar to CallStation but will sometimes bet/raise.
    
    Never folds, but will occasionally make aggressive moves.
    """
    
    def __init__(self, name: str = "NeverFold", aggression: float = 0.2):
        super().__init__()
        self._name = name
        self._aggression = aggression  # Probability of raising when possible
        import random
        self._rng = random.Random()
    
    @property
    def name(self) -> str:
        return self._name
    
    def get_action(
        self, 
        game_state: GameState, 
        legal_actions: LegalActions
    ) -> Tuple[Action, int]:
        """Check/call but sometimes raise."""
        
        # Occasionally raise
        if self._rng.random() < self._aggression:
            if legal_actions.can_raise:
                return (Action.RAISE, legal_actions.min_raise)
            if legal_actions.can_bet:
                return (Action.BET, legal_actions.min_bet)
        
        # Default to check/call
        if legal_actions.can_check:
            return (Action.CHECK, 0)
        
        if legal_actions.can_call:
            return (Action.CALL, legal_actions.call_amount)
        
        if legal_actions.can_all_in:
            return (Action.ALL_IN, legal_actions.all_in_amount)
        
        return (Action.FOLD, 0)
