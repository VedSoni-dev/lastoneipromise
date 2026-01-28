"""
Card, Deck, and Hand representation using dataclasses.
Provides immutable card objects and a shuffleable deck.
"""

from dataclasses import dataclass
from enum import IntEnum
from typing import List, Optional
import random
import json


class Suit(IntEnum):
    """Card suits with unicode symbols."""
    CLUBS = 0
    DIAMONDS = 1
    HEARTS = 2
    SPADES = 3
    
    @property
    def symbol(self) -> str:
        symbols = ['♣', '♦', '♥', '♠']
        return symbols[self.value]
    
    def __str__(self) -> str:
        return self.symbol


class Rank(IntEnum):
    """Card ranks from 2 to Ace (14)."""
    TWO = 2
    THREE = 3
    FOUR = 4
    FIVE = 5
    SIX = 6
    SEVEN = 7
    EIGHT = 8
    NINE = 9
    TEN = 10
    JACK = 11
    QUEEN = 12
    KING = 13
    ACE = 14
    
    @property
    def symbol(self) -> str:
        if self.value <= 10:
            return str(self.value)
        return {11: 'J', 12: 'Q', 13: 'K', 14: 'A'}[self.value]
    
    def __str__(self) -> str:
        return self.symbol


@dataclass(frozen=True, order=True)
class Card:
    """
    Immutable card representation.
    
    Cards are ordered by rank first, then by suit.
    """
    rank: Rank
    suit: Suit
    
    def __post_init__(self):
        if not isinstance(self.rank, Rank):
            object.__setattr__(self, 'rank', Rank(self.rank))
        if not isinstance(self.suit, Suit):
            object.__setattr__(self, 'suit', Suit(self.suit))
    
    def __str__(self) -> str:
        return f"{self.rank.symbol}{self.suit.symbol}"
    
    def __repr__(self) -> str:
        return f"Card({self.rank.symbol}{self.suit.symbol})"
    
    def to_dict(self) -> dict:
        """Serialize card to dictionary for JSON."""
        return {
            'rank': self.rank.value,
            'suit': self.suit.value,
            'display': str(self)
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Card':
        """Deserialize card from dictionary."""
        return cls(Rank(data['rank']), Suit(data['suit']))
    
    @classmethod
    def from_string(cls, s: str) -> 'Card':
        """
        Parse card from string like 'As', 'Kh', '10c', '2d'.
        
        Format: <rank><suit> where suit is c/d/h/s
        """
        s = s.strip().upper()
        suit_map = {'C': Suit.CLUBS, 'D': Suit.DIAMONDS, 'H': Suit.HEARTS, 'S': Suit.SPADES}
        rank_map = {
            'A': Rank.ACE, 'K': Rank.KING, 'Q': Rank.QUEEN, 'J': Rank.JACK, 'T': Rank.TEN,
            '10': Rank.TEN, '9': Rank.NINE, '8': Rank.EIGHT, '7': Rank.SEVEN,
            '6': Rank.SIX, '5': Rank.FIVE, '4': Rank.FOUR, '3': Rank.THREE, '2': Rank.TWO
        }
        
        # Handle 10 specially
        if s.startswith('10'):
            rank_str = '10'
            suit_str = s[2:]
        else:
            rank_str = s[0]
            suit_str = s[1:]
        
        return cls(rank_map[rank_str], suit_map[suit_str])


class Deck:
    """
    A standard 52-card deck with shuffle and deal operations.
    """
    
    def __init__(self, seed: Optional[int] = None):
        """
        Initialize a fresh deck.
        
        Args:
            seed: Optional random seed for reproducible shuffles.
        """
        self._cards: List[Card] = []
        self._dealt: List[Card] = []
        self._rng = random.Random(seed)
        self.reset()
    
    def reset(self) -> None:
        """Reset deck to full 52 cards and shuffle."""
        self._cards = [
            Card(rank, suit)
            for suit in Suit
            for rank in Rank
        ]
        self._dealt = []
        self.shuffle()
    
    def shuffle(self) -> None:
        """Shuffle remaining cards in the deck."""
        self._rng.shuffle(self._cards)
    
    def deal(self, count: int = 1) -> List[Card]:
        """
        Deal cards from the top of the deck.
        
        Args:
            count: Number of cards to deal.
            
        Returns:
            List of dealt cards.
            
        Raises:
            ValueError: If not enough cards remain.
        """
        if count > len(self._cards):
            raise ValueError(f"Cannot deal {count} cards, only {len(self._cards)} remaining")
        
        dealt = [self._cards.pop() for _ in range(count)]
        self._dealt.extend(dealt)
        return dealt
    
    def deal_one(self) -> Card:
        """Deal a single card."""
        return self.deal(1)[0]
    
    def burn(self) -> Card:
        """Burn (discard) top card without returning it (for proper poker dealing)."""
        if not self._cards:
            raise ValueError("No cards remaining to burn")
        return self._cards.pop()
    
    @property
    def remaining(self) -> int:
        """Number of cards remaining in deck."""
        return len(self._cards)
    
    @property
    def dealt_cards(self) -> List[Card]:
        """List of all dealt cards."""
        return self._dealt.copy()
    
    def __len__(self) -> int:
        return len(self._cards)
    
    def __repr__(self) -> str:
        return f"Deck({self.remaining} cards remaining)"


def parse_hand(hand_str: str) -> List[Card]:
    """
    Parse a hand string like 'AsKs' or 'Ah Kh' into a list of cards.
    
    Handles both with and without spaces between cards.
    """
    hand_str = hand_str.strip().upper()
    
    # Try splitting by spaces first
    if ' ' in hand_str:
        parts = hand_str.split()
    else:
        # Split by detecting card boundaries
        parts = []
        i = 0
        while i < len(hand_str):
            # Check for 10
            if hand_str[i:i+2] == '10':
                parts.append(hand_str[i:i+3])
                i += 3
            else:
                parts.append(hand_str[i:i+2])
                i += 2
    
    return [Card.from_string(p) for p in parts]
