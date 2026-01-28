"""
Utility functions for the poker engine.
"""

from typing import List, Optional, Tuple
from .card import Card, Rank, Suit


def format_chips(amount: int) -> str:
    """Format chip amount with proper formatting."""
    if amount >= 1000000:
        return f"{amount/1000000:.1f}M"
    elif amount >= 1000:
        return f"{amount/1000:.1f}K"
    return str(amount)


def format_hand(cards: List[Card]) -> str:
    """Format a list of cards as a readable string."""
    return ' '.join(str(c) for c in cards)


def get_position_name(position: int, num_players: int) -> str:
    """
    Get position name based on seat relative to button.
    
    Args:
        position: Seat position (0 = button for heads-up, or based on num_players)
        num_players: Number of players at table
    """
    if num_players == 2:
        return "BTN" if position == 0 else "BB"
    
    positions_9max = {
        0: "BTN",
        1: "SB", 
        2: "BB",
        3: "UTG",
        4: "UTG+1",
        5: "MP",
        6: "MP+1",
        7: "CO",
        8: "BTN",
    }
    
    if num_players <= 3:
        names = ["BTN", "SB", "BB"]
        return names[position % len(names)]
    elif num_players <= 6:
        names = ["BTN", "SB", "BB", "UTG", "MP", "CO"]
        return names[position % len(names)]
    else:
        return positions_9max.get(position, f"Seat {position}")


def calculate_pot_odds(pot: int, to_call: int) -> float:
    """Calculate pot odds as a ratio."""
    if to_call == 0:
        return float('inf')
    return pot / to_call


def calculate_equity_needed(pot: int, to_call: int) -> float:
    """Calculate equity needed to break even on a call."""
    if pot + to_call == 0:
        return 0.0
    return to_call / (pot + to_call)


def calculate_bet_sizing(
    pot: int,
    fraction: float,
    min_bet: int,
    max_bet: int
) -> int:
    """
    Calculate bet size as fraction of pot.
    
    Args:
        pot: Current pot size
        fraction: Desired pot fraction (e.g., 0.5 for half-pot)
        min_bet: Minimum allowed bet
        max_bet: Maximum allowed bet (typically stack)
        
    Returns:
        Appropriate bet size
    """
    target = int(pot * fraction)
    return max(min_bet, min(target, max_bet))
