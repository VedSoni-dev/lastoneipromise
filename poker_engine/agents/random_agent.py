"""
Random Agent

An agent that selects uniformly random legal actions.
Useful as a baseline for testing and as a simple opponent.
"""

import random
from typing import Tuple, Optional

from .base_agent import BaseAgent
from ..actions import Action, LegalActions
from ..game_state import GameState


class RandomAgent(BaseAgent):
    """
    Agent that makes completely random legal moves.
    
    Selection is uniform across available action types.
    For bets/raises, the amount is randomly chosen within legal bounds.
    
    Args:
        name: Optional custom name for this agent.
        seed: Random seed for reproducibility.
    """
    
    def __init__(self, name: str = "RandomBot", seed: Optional[int] = None):
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
        """Select a random legal action."""
        actions = legal_actions.get_actions()
        
        if not actions:
            # Shouldn't happen, but default to fold
            return (Action.FOLD, 0)
        
        # Pick random action type
        action = self._rng.choice(actions)
        
        # Determine amount based on action type
        if action == Action.FOLD:
            return (Action.FOLD, 0)
        
        elif action == Action.CHECK:
            return (Action.CHECK, 0)
        
        elif action == Action.CALL:
            return (Action.CALL, legal_actions.call_amount)
        
        elif action == Action.BET:
            # Random bet between min and max
            amount = self._rng.randint(legal_actions.min_bet, legal_actions.max_bet)
            return (Action.BET, amount)
        
        elif action == Action.RAISE:
            # Random raise between min and max
            amount = self._rng.randint(legal_actions.min_raise, legal_actions.max_raise)
            return (Action.RAISE, amount)
        
        elif action == Action.ALL_IN:
            return (Action.ALL_IN, legal_actions.all_in_amount)
        
        # Default fallback
        return (Action.FOLD, 0)


class WeightedRandomAgent(BaseAgent):
    """
    Agent that makes random moves with configurable weights.
    
    Allows biasing toward certain action types while remaining random.
    
    Args:
        name: Agent name.
        weights: Dict mapping Action -> weight (higher = more likely).
        seed: Random seed.
    """
    
    def __init__(
        self, 
        name: str = "WeightedRandomBot",
        weights: Optional[dict] = None,
        seed: Optional[int] = None
    ):
        super().__init__()
        self._name = name
        self._rng = random.Random(seed)
        
        # Default weights favor passive play
        self._weights = weights or {
            Action.FOLD: 1.0,
            Action.CHECK: 2.0,
            Action.CALL: 2.0,
            Action.BET: 1.0,
            Action.RAISE: 0.5,
            Action.ALL_IN: 0.1,
        }
    
    @property
    def name(self) -> str:
        return self._name
    
    def get_action(
        self, 
        game_state: GameState, 
        legal_actions: LegalActions
    ) -> Tuple[Action, int]:
        """Select weighted random action."""
        actions = legal_actions.get_actions()
        
        if not actions:
            return (Action.FOLD, 0)
        
        # Calculate weighted probabilities
        weights = [self._weights.get(a, 1.0) for a in actions]
        total = sum(weights)
        
        if total == 0:
            action = self._rng.choice(actions)
        else:
            # Weighted random selection
            r = self._rng.random() * total
            cumulative = 0
            action = actions[0]
            for a, w in zip(actions, weights):
                cumulative += w
                if r <= cumulative:
                    action = a
                    break
        
        # Determine amount
        if action == Action.BET:
            amount = self._rng.randint(legal_actions.min_bet, legal_actions.max_bet)
            return (Action.BET, amount)
        elif action == Action.RAISE:
            amount = self._rng.randint(legal_actions.min_raise, legal_actions.max_raise)
            return (Action.RAISE, amount)
        elif action == Action.CALL:
            return (Action.CALL, legal_actions.call_amount)
        elif action == Action.ALL_IN:
            return (Action.ALL_IN, legal_actions.all_in_amount)
        else:
            return (action, 0)
