"""
PlayerState representation for tracking player information during a hand.
"""

from dataclasses import dataclass, field
from typing import List, Optional
from .card import Card


@dataclass
class PlayerState:
    """
    Represents a player's state during a poker hand.
    
    Attributes:
        player_id: Unique identifier for the player.
        stack: Current chip count.
        hole_cards: Player's two private cards (empty if not dealt yet).
        current_bet: Amount bet in current betting round.
        total_bet_this_hand: Total amount invested this hand.
        folded: Whether player has folded.
        is_all_in: Whether player is all-in.
        position: Seat position at the table (0 = first seat).
        name: Optional display name.
    """
    player_id: int
    stack: int
    hole_cards: List[Card] = field(default_factory=list)
    current_bet: int = 0
    total_bet_this_hand: int = 0
    folded: bool = False
    is_all_in: bool = False
    position: int = 0
    name: Optional[str] = None
    
    def __post_init__(self):
        if self.name is None:
            self.name = f"Player {self.player_id}"
    
    @property
    def is_active(self) -> bool:
        """Player can still act (not folded, not all-in, has chips)."""
        return not self.folded and not self.is_all_in and self.stack > 0
    
    @property
    def is_in_hand(self) -> bool:
        """Player is still competing for the pot."""
        return not self.folded
    
    def bet(self, amount: int) -> int:
        """
        Place a bet, deducting from stack.
        
        Args:
            amount: Amount to bet.
            
        Returns:
            Actual amount bet (may be less if going all-in).
        """
        actual_amount = min(amount, self.stack)
        self.stack -= actual_amount
        self.current_bet += actual_amount
        self.total_bet_this_hand += actual_amount
        
        if self.stack == 0:
            self.is_all_in = True
        
        return actual_amount
    
    def fold(self) -> None:
        """Mark player as folded."""
        self.folded = True
    
    def win(self, amount: int) -> None:
        """Add winnings to stack."""
        self.stack += amount
    
    def reset_for_new_round(self) -> None:
        """Reset betting state for a new betting round."""
        self.current_bet = 0
    
    def reset_for_new_hand(self) -> None:
        """Reset all state for a new hand."""
        self.hole_cards = []
        self.current_bet = 0
        self.total_bet_this_hand = 0
        self.folded = False
        self.is_all_in = False
    
    def to_dict(self, hide_cards: bool = False) -> dict:
        """
        Serialize player state to dictionary.
        
        Args:
            hide_cards: If True, don't include hole cards (for opponent view).
        """
        result = {
            'player_id': self.player_id,
            'name': self.name,
            'stack': self.stack,
            'current_bet': self.current_bet,
            'total_bet_this_hand': self.total_bet_this_hand,
            'folded': self.folded,
            'is_all_in': self.is_all_in,
            'position': self.position,
        }
        
        if not hide_cards and self.hole_cards:
            result['hole_cards'] = [c.to_dict() for c in self.hole_cards]
        
        return result
    
    @classmethod
    def from_dict(cls, data: dict) -> 'PlayerState':
        """Deserialize player state from dictionary."""
        player = cls(
            player_id=data['player_id'],
            stack=data['stack'],
            current_bet=data.get('current_bet', 0),
            total_bet_this_hand=data.get('total_bet_this_hand', 0),
            folded=data.get('folded', False),
            is_all_in=data.get('is_all_in', False),
            position=data.get('position', 0),
            name=data.get('name'),
        )
        
        if 'hole_cards' in data:
            player.hole_cards = [Card.from_dict(c) for c in data['hole_cards']]
        
        return player
    
    def __repr__(self) -> str:
        cards_str = ' '.join(str(c) for c in self.hole_cards) if self.hole_cards else "??"
        status = "FOLDED" if self.folded else ("ALL-IN" if self.is_all_in else "ACTIVE")
        return f"Player({self.name}, ${self.stack}, [{cards_str}], {status})"
