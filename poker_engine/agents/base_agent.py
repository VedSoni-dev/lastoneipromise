"""
Base Agent Interface

Defines the abstract base class that all poker agents must implement.
This is the foundation for both simple rule-based agents and complex ML agents.
"""

from abc import ABC, abstractmethod
from typing import Tuple, List, Optional, Dict, Any
from dataclasses import dataclass, field

from ..card import Card
from ..actions import Action, LegalActions
from ..game_state import GameState


@dataclass
class HandResult:
    """Result of a completed hand for agent learning."""
    winners: List[int]
    payouts: Dict[int, int]
    went_to_showdown: bool
    final_pot: int = 0
    
    def is_winner(self, player_id: int) -> bool:
        return player_id in self.winners
    
    def get_payout(self, player_id: int) -> int:
        return self.payouts.get(player_id, 0)


@dataclass
class AgentContext:
    """Context provided to agent for decision making."""
    hole_cards: List[Card] = field(default_factory=list)
    position: int = 0  # Position relative to button
    hand_number: int = 0
    
    # Stats tracked during the hand
    actions_taken: List[Tuple[int, Action, int]] = field(default_factory=list)
    
    def add_action(self, player_id: int, action: Action, amount: int):
        self.actions_taken.append((player_id, action, amount))


class BaseAgent(ABC):
    """
    Abstract base class for all poker agents.
    
    Agents receive game state and legal actions, and must return
    a valid action. They can also receive callbacks at hand start/end
    for learning purposes.
    
    Example Implementation:
        class MyAgent(BaseAgent):
            @property
            def name(self) -> str:
                return "MyBot"
            
            def get_action(self, game_state, legal_actions) -> Tuple[Action, int]:
                if legal_actions.can_check:
                    return (Action.CHECK, 0)
                return (Action.FOLD, 0)
    """
    
    def __init__(self):
        self._context = AgentContext()
        self._player_id: Optional[int] = None
    
    @property
    @abstractmethod
    def name(self) -> str:
        """
        Agent's display name.
        
        Returns:
            Human-readable name for this agent.
        """
        pass
    
    @property
    def player_id(self) -> Optional[int]:
        """Get the player ID this agent is controlling."""
        return self._player_id
    
    @player_id.setter
    def player_id(self, value: int):
        """Set the player ID."""
        self._player_id = value
    
    @abstractmethod
    def get_action(
        self, 
        game_state: GameState, 
        legal_actions: LegalActions
    ) -> Tuple[Action, int]:
        """
        Decide on an action given the current game state.
        
        This is the core decision-making method. The agent should analyze
        the game state and return a legal action.
        
        Args:
            game_state: Current game state (opponent cards hidden).
            legal_actions: Available legal actions with bet limits.
            
        Returns:
            Tuple of (Action, amount). Amount is:
                - 0 for FOLD, CHECK, CALL
                - Bet/raise amount for BET, RAISE
                - Stack amount for ALL_IN
        """
        pass
    
    def on_hand_start(self, position: int, hole_cards: List[Card]) -> None:
        """
        Called at the start of each hand.
        
        Override this method to perform any hand-start initialization,
        such as storing hole cards for later decision making.
        
        Args:
            position: Seat position (0 = button in heads-up).
            hole_cards: The two hole cards dealt to this agent.
        """
        self._context = AgentContext(
            hole_cards=hole_cards.copy(),
            position=position,
        )
    
    def on_hand_end(self, result: HandResult) -> None:
        """
        Called at the end of each hand.
        
        Override this method for learning agents that need to update
        their strategy based on hand results.
        
        Args:
            result: HandResult containing winners, payouts, etc.
        """
        pass
    
    def on_action(self, player_id: int, action: Action, amount: int) -> None:
        """
        Called when any player takes an action.
        
        Override this to track opponent actions for opponent modeling.
        
        Args:
            player_id: ID of the player who acted.
            action: The action taken.
            amount: Bet/raise amount (0 for fold/check/call).
        """
        self._context.add_action(player_id, action, amount)
    
    def reset(self) -> None:
        """
        Reset agent state for a new session.
        
        Called between separate game sessions.
        """
        self._context = AgentContext()
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get agent statistics for analysis.
        
        Override this to provide custom stats.
        
        Returns:
            Dictionary of stat name -> value.
        """
        return {"name": self.name}
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(name={self.name})"
