"""
Action system for poker game moves.
"""

from dataclasses import dataclass
from enum import Enum, auto
from typing import Optional, List, Tuple


class Action(Enum):
    """Possible poker actions."""
    FOLD = auto()
    CHECK = auto()
    CALL = auto()
    BET = auto()
    RAISE = auto()
    ALL_IN = auto()
    
    def __str__(self) -> str:
        return self.name.lower()


@dataclass
class PlayerAction:
    """
    Represents an action taken by a player.
    
    Attributes:
        action: The type of action.
        amount: Bet/raise amount (0 for fold/check/call).
        player_id: ID of the player taking action.
    """
    action: Action
    amount: int = 0
    player_id: Optional[int] = None
    
    def to_dict(self) -> dict:
        """Serialize to dictionary."""
        return {
            'action': self.action.name,
            'amount': self.amount,
            'player_id': self.player_id,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'PlayerAction':
        """Deserialize from dictionary."""
        return cls(
            action=Action[data['action']],
            amount=data.get('amount', 0),
            player_id=data.get('player_id'),
        )
    
    def __str__(self) -> str:
        if self.action in (Action.BET, Action.RAISE, Action.ALL_IN):
            return f"{self.action.name} {self.amount}"
        return self.action.name


@dataclass
class LegalActions:
    """
    Container for legal actions available to a player.
    
    Attributes:
        can_fold: Whether fold is available.
        can_check: Whether check is available.
        can_call: Whether call is available, and the call amount.
        can_bet: Whether bet is available, with min/max amounts.
        can_raise: Whether raise is available, with min/max amounts.
        can_all_in: Whether all-in is available.
    """
    can_fold: bool = True
    can_check: bool = False
    call_amount: int = 0
    min_bet: int = 0
    max_bet: int = 0
    min_raise: int = 0
    max_raise: int = 0
    all_in_amount: int = 0
    
    @property
    def can_call(self) -> bool:
        return self.call_amount > 0
    
    @property
    def can_bet(self) -> bool:
        return self.min_bet > 0 and self.max_bet >= self.min_bet
    
    @property
    def can_raise(self) -> bool:
        return self.min_raise > 0 and self.max_raise >= self.min_raise
    
    @property
    def can_all_in(self) -> bool:
        return self.all_in_amount > 0
    
    def get_actions(self) -> List[Action]:
        """Get list of available action types."""
        actions = []
        if self.can_fold:
            actions.append(Action.FOLD)
        if self.can_check:
            actions.append(Action.CHECK)
        if self.can_call:
            actions.append(Action.CALL)
        if self.can_bet:
            actions.append(Action.BET)
        if self.can_raise:
            actions.append(Action.RAISE)
        if self.can_all_in:
            actions.append(Action.ALL_IN)
        return actions
    
    def validate_action(self, action: Action, amount: int = 0) -> Tuple[bool, str]:
        """
        Validate if an action is legal.
        
        Returns:
            Tuple of (is_valid, error_message).
        """
        if action == Action.FOLD:
            return (True, "") if self.can_fold else (False, "Cannot fold")
        
        if action == Action.CHECK:
            return (True, "") if self.can_check else (False, "Cannot check, must call or fold")
        
        if action == Action.CALL:
            if not self.can_call:
                return (False, "Nothing to call")
            return (True, "")
        
        if action == Action.BET:
            if not self.can_bet:
                return (False, "Cannot bet, can only raise")
            if amount < self.min_bet:
                return (False, f"Bet must be at least {self.min_bet}")
            if amount > self.max_bet:
                return (False, f"Bet cannot exceed {self.max_bet}")
            return (True, "")
        
        if action == Action.RAISE:
            if not self.can_raise:
                return (False, "Cannot raise")
            if amount < self.min_raise:
                return (False, f"Raise must be at least {self.min_raise}")
            if amount > self.max_raise:
                return (False, f"Raise cannot exceed {self.max_raise}")
            return (True, "")
        
        if action == Action.ALL_IN:
            return (True, "") if self.can_all_in else (False, "Cannot go all-in")
        
        return (False, "Unknown action")
    
    def to_dict(self) -> dict:
        """Serialize to dictionary."""
        return {
            'can_fold': self.can_fold,
            'can_check': self.can_check,
            'call_amount': self.call_amount,
            'min_bet': self.min_bet,
            'max_bet': self.max_bet,
            'min_raise': self.min_raise,
            'max_raise': self.max_raise,
            'all_in_amount': self.all_in_amount,
            'available_actions': [a.name for a in self.get_actions()],
        }
    
    def __repr__(self) -> str:
        actions = self.get_actions()
        return f"LegalActions({', '.join(a.name for a in actions)})"
