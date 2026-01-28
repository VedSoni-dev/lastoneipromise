"""
Optimized poker hand evaluator for Texas Hold'em.

Features:
- Evaluate best 5-card hand from 7 cards
- Return comparable hand rank tuples
- Monte Carlo hand strength simulation
- LRU caching for performance
"""

from dataclasses import dataclass
from enum import IntEnum
from functools import lru_cache
from typing import List, Tuple, Optional, Set
from collections import Counter
import random
from itertools import combinations

from .card import Card, Deck, Rank, Suit


class HandRank(IntEnum):
    """Hand rankings from lowest to highest."""
    HIGH_CARD = 0
    PAIR = 1
    TWO_PAIR = 2
    THREE_OF_A_KIND = 3
    STRAIGHT = 4
    FLUSH = 5
    FULL_HOUSE = 6
    FOUR_OF_A_KIND = 7
    STRAIGHT_FLUSH = 8
    ROYAL_FLUSH = 9
    
    def __str__(self) -> str:
        return self.name.replace('_', ' ').title()


@dataclass(frozen=True, order=True)
class HandValue:
    """
    Comparable hand value.
    
    Two HandValues can be compared directly to determine winner.
    The tuple ordering is: (rank, primary_kickers, secondary_kickers, etc.)
    """
    rank: HandRank
    kickers: Tuple[int, ...]
    
    def __str__(self) -> str:
        return f"{self.rank}"
    
    def describe(self) -> str:
        """Human-readable description of the hand."""
        rank_names = {14: 'Ace', 13: 'King', 12: 'Queen', 11: 'Jack', 10: 'Ten',
                      9: 'Nine', 8: 'Eight', 7: 'Seven', 6: 'Six', 5: 'Five',
                      4: 'Four', 3: 'Three', 2: 'Two'}
        
        if self.rank == HandRank.HIGH_CARD:
            return f"High Card {rank_names.get(self.kickers[0], self.kickers[0])}"
        elif self.rank == HandRank.PAIR:
            return f"Pair of {rank_names.get(self.kickers[0], self.kickers[0])}s"
        elif self.rank == HandRank.TWO_PAIR:
            return f"Two Pair, {rank_names.get(self.kickers[0], self.kickers[0])}s and {rank_names.get(self.kickers[1], self.kickers[1])}s"
        elif self.rank == HandRank.THREE_OF_A_KIND:
            return f"Three {rank_names.get(self.kickers[0], self.kickers[0])}s"
        elif self.rank == HandRank.STRAIGHT:
            return f"Straight, {rank_names.get(self.kickers[0], self.kickers[0])} high"
        elif self.rank == HandRank.FLUSH:
            return f"Flush, {rank_names.get(self.kickers[0], self.kickers[0])} high"
        elif self.rank == HandRank.FULL_HOUSE:
            return f"Full House, {rank_names.get(self.kickers[0], self.kickers[0])}s full of {rank_names.get(self.kickers[1], self.kickers[1])}s"
        elif self.rank == HandRank.FOUR_OF_A_KIND:
            return f"Four {rank_names.get(self.kickers[0], self.kickers[0])}s"
        elif self.rank == HandRank.STRAIGHT_FLUSH:
            return f"Straight Flush, {rank_names.get(self.kickers[0], self.kickers[0])} high"
        elif self.rank == HandRank.ROYAL_FLUSH:
            return "Royal Flush"
        return str(self.rank)


def _cards_to_tuple(cards: List[Card]) -> Tuple[Tuple[int, int], ...]:
    """Convert cards to hashable tuple for caching."""
    return tuple(sorted((c.rank.value, c.suit.value) for c in cards))


@lru_cache(maxsize=10000)
def _evaluate_5_cards_cached(cards_tuple: Tuple[Tuple[int, int], ...]) -> Tuple[int, Tuple[int, ...]]:
    """Cached 5-card evaluation."""
    cards = [Card(Rank(r), Suit(s)) for r, s in cards_tuple]
    result = _evaluate_5_cards(cards)
    return (result.rank.value, result.kickers)


def _evaluate_5_cards(cards: List[Card]) -> HandValue:
    """
    Evaluate exactly 5 cards and return HandValue.
    
    This is the core evaluation function.
    """
    if len(cards) != 5:
        raise ValueError(f"Must have exactly 5 cards, got {len(cards)}")
    
    ranks = sorted([c.rank.value for c in cards], reverse=True)
    suits = [c.suit for c in cards]
    rank_counts = Counter(ranks)
    
    # Check for flush
    is_flush = len(set(suits)) == 1
    
    # Check for straight
    unique_ranks = sorted(set(ranks), reverse=True)
    is_straight = False
    straight_high = 0
    
    if len(unique_ranks) >= 5:
        # Check normal straight
        for i in range(len(unique_ranks) - 4):
            if unique_ranks[i] - unique_ranks[i + 4] == 4:
                is_straight = True
                straight_high = unique_ranks[i]
                break
        
        # Check wheel (A-2-3-4-5)
        if not is_straight and 14 in unique_ranks:
            wheel_ranks = {14, 2, 3, 4, 5}
            if wheel_ranks.issubset(set(unique_ranks)):
                is_straight = True
                straight_high = 5  # 5-high straight
    
    # Determine hand rank
    count_values = sorted(rank_counts.values(), reverse=True)
    
    if is_straight and is_flush:
        if straight_high == 14 and min(ranks) == 10:
            return HandValue(HandRank.ROYAL_FLUSH, (14,))
        return HandValue(HandRank.STRAIGHT_FLUSH, (straight_high,))
    
    if count_values == [4, 1]:
        quad_rank = [r for r, c in rank_counts.items() if c == 4][0]
        kicker = [r for r, c in rank_counts.items() if c == 1][0]
        return HandValue(HandRank.FOUR_OF_A_KIND, (quad_rank, kicker))
    
    if count_values == [3, 2]:
        trips_rank = [r for r, c in rank_counts.items() if c == 3][0]
        pair_rank = [r for r, c in rank_counts.items() if c == 2][0]
        return HandValue(HandRank.FULL_HOUSE, (trips_rank, pair_rank))
    
    if is_flush:
        return HandValue(HandRank.FLUSH, tuple(ranks))
    
    if is_straight:
        return HandValue(HandRank.STRAIGHT, (straight_high,))
    
    if count_values == [3, 1, 1]:
        trips_rank = [r for r, c in rank_counts.items() if c == 3][0]
        kickers = sorted([r for r, c in rank_counts.items() if c == 1], reverse=True)
        return HandValue(HandRank.THREE_OF_A_KIND, (trips_rank,) + tuple(kickers))
    
    if count_values == [2, 2, 1]:
        pairs = sorted([r for r, c in rank_counts.items() if c == 2], reverse=True)
        kicker = [r for r, c in rank_counts.items() if c == 1][0]
        return HandValue(HandRank.TWO_PAIR, tuple(pairs) + (kicker,))
    
    if count_values == [2, 1, 1, 1]:
        pair_rank = [r for r, c in rank_counts.items() if c == 2][0]
        kickers = sorted([r for r, c in rank_counts.items() if c == 1], reverse=True)
        return HandValue(HandRank.PAIR, (pair_rank,) + tuple(kickers))
    
    # High card
    return HandValue(HandRank.HIGH_CARD, tuple(ranks))


def evaluate_hand(cards: List[Card]) -> HandValue:
    """
    Evaluate a poker hand of 5-7 cards.
    
    For 7 cards, finds the best 5-card combination.
    
    Args:
        cards: List of 5-7 cards.
        
    Returns:
        HandValue with rank and kickers.
    """
    if len(cards) < 5:
        raise ValueError(f"Need at least 5 cards, got {len(cards)}")
    
    if len(cards) == 5:
        return _evaluate_5_cards(cards)
    
    # Find best 5-card combination
    best_value = None
    for combo in combinations(cards, 5):
        cards_tuple = _cards_to_tuple(list(combo))
        rank_val, kickers = _evaluate_5_cards_cached(cards_tuple)
        value = HandValue(HandRank(rank_val), kickers)
        if best_value is None or value > best_value:
            best_value = value
    
    return best_value


def best_five_from_seven(hole_cards: List[Card], community_cards: List[Card]) -> HandValue:
    """
    Find the best 5-card hand from hole cards + community cards.
    
    Args:
        hole_cards: Player's 2 private cards.
        community_cards: 3-5 community cards.
        
    Returns:
        Best possible HandValue.
    """
    all_cards = hole_cards + community_cards
    return evaluate_hand(all_cards)


def hand_strength(
    hole_cards: List[Card],
    community_cards: List[Card],
    num_opponents: int = 1,
    simulations: int = 1000,
    seed: Optional[int] = None
) -> float:
    """
    Calculate hand strength using Monte Carlo simulation.
    
    Simulates random opponent hands and board runouts to estimate
    win probability.
    
    Args:
        hole_cards: Player's 2 hole cards.
        community_cards: Current community cards (0-5).
        num_opponents: Number of opponents to simulate.
        simulations: Number of Monte Carlo simulations.
        seed: Optional random seed for reproducibility.
        
    Returns:
        Win probability from 0.0 to 1.0.
    """
    if len(hole_cards) != 2:
        raise ValueError("Must have exactly 2 hole cards")
    
    rng = random.Random(seed)
    wins = 0
    ties = 0
    
    # Cards already in use
    used_cards: Set[Card] = set(hole_cards) | set(community_cards)
    
    # Build available card pool
    all_cards = [Card(rank, suit) for suit in Suit for rank in Rank]
    available = [c for c in all_cards if c not in used_cards]
    
    cards_needed = 5 - len(community_cards)
    
    for _ in range(simulations):
        # Shuffle available cards
        deck = available.copy()
        rng.shuffle(deck)
        deck_idx = 0
        
        # Complete the board
        simulated_board = list(community_cards)
        for _ in range(cards_needed):
            simulated_board.append(deck[deck_idx])
            deck_idx += 1
        
        # Evaluate our hand
        our_value = evaluate_hand(hole_cards + simulated_board)
        
        # Simulate opponent hands
        we_win = True
        is_tie = False
        
        for _ in range(num_opponents):
            opp_cards = [deck[deck_idx], deck[deck_idx + 1]]
            deck_idx += 2
            
            opp_value = evaluate_hand(opp_cards + simulated_board)
            
            if opp_value > our_value:
                we_win = False
                break
            elif opp_value == our_value:
                is_tie = True
        
        if we_win:
            if is_tie:
                ties += 1
            else:
                wins += 1
    
    # Ties count as half a win
    return (wins + ties * 0.5) / simulations


def equity_vs_range(
    hole_cards: List[Card],
    opponent_range: List[List[Card]],
    community_cards: List[Card],
    simulations_per_hand: int = 100,
    seed: Optional[int] = None
) -> float:
    """
    Calculate equity against a range of opponent hands.
    
    Args:
        hole_cards: Our hole cards.
        opponent_range: List of possible opponent hole card combinations.
        community_cards: Current community cards.
        simulations_per_hand: Simulations per opponent hand.
        seed: Random seed.
        
    Returns:
        Average equity across the range.
    """
    if not opponent_range:
        return 1.0
    
    rng = random.Random(seed)
    total_equity = 0.0
    valid_hands = 0
    
    for opp_hand in opponent_range:
        # Skip if opponent hand overlaps with our cards or board
        if any(c in hole_cards or c in community_cards for c in opp_hand):
            continue
        
        equity = hand_strength(
            hole_cards, 
            community_cards, 
            num_opponents=1, 
            simulations=simulations_per_hand,
            seed=rng.randint(0, 1000000)
        )
        total_equity += equity
        valid_hands += 1
    
    return total_equity / valid_hands if valid_hands > 0 else 0.5


def hand_potential(
    hole_cards: List[Card],
    community_cards: List[Card],
    simulations: int = 500,
    seed: Optional[int] = None
) -> Tuple[float, float]:
    """
    Calculate positive and negative potential of a hand.
    
    Positive potential: probability of improving from behind to ahead.
    Negative potential: probability of falling from ahead to behind.
    
    Args:
        hole_cards: Our hole cards.
        community_cards: Current community cards (must be 3-4).
        simulations: Number of simulations.
        seed: Random seed.
        
    Returns:
        Tuple of (positive_potential, negative_potential).
    """
    if len(community_cards) not in (3, 4):
        return (0.0, 0.0)
    
    rng = random.Random(seed)
    
    used_cards = set(hole_cards) | set(community_cards)
    all_cards = [Card(rank, suit) for suit in Suit for rank in Rank]
    available = [c for c in all_cards if c not in used_cards]
    
    ahead_stays_ahead = 0
    ahead_falls_behind = 0
    behind_improves = 0
    behind_stays_behind = 0
    
    for _ in range(simulations):
        deck = available.copy()
        rng.shuffle(deck)
        deck_idx = 0
        
        # Opponent cards
        opp_cards = [deck[deck_idx], deck[deck_idx + 1]]
        deck_idx += 2
        
        # Current hand values
        our_current = evaluate_hand(hole_cards + community_cards)
        opp_current = evaluate_hand(opp_cards + community_cards)
        currently_ahead = our_current > opp_current
        
        # Complete board
        cards_to_deal = 5 - len(community_cards)
        future_cards = [deck[deck_idx + i] for i in range(cards_to_deal)]
        final_board = community_cards + future_cards
        
        # Final hand values
        our_final = evaluate_hand(hole_cards + final_board)
        opp_final = evaluate_hand(opp_cards + final_board)
        finally_ahead = our_final > opp_final
        
        if currently_ahead:
            if finally_ahead:
                ahead_stays_ahead += 1
            else:
                ahead_falls_behind += 1
        else:
            if finally_ahead:
                behind_improves += 1
            else:
                behind_stays_behind += 1
    
    total_ahead = ahead_stays_ahead + ahead_falls_behind
    total_behind = behind_improves + behind_stays_behind
    
    positive_potential = behind_improves / total_behind if total_behind > 0 else 0.0
    negative_potential = ahead_falls_behind / total_ahead if total_ahead > 0 else 0.0
    
    return (positive_potential, negative_potential)


def get_outs(hole_cards: List[Card], community_cards: List[Card]) -> List[Card]:
    """
    Find cards that would improve the hand.
    
    Returns list of cards that would give us a better hand.
    """
    if len(community_cards) >= 5:
        return []
    
    used_cards = set(hole_cards) | set(community_cards)
    all_cards = [Card(rank, suit) for suit in Suit for rank in Rank]
    available = [c for c in all_cards if c not in used_cards]
    
    current_value = evaluate_hand(hole_cards + community_cards) if len(community_cards) >= 3 else None
    
    outs = []
    for card in available:
        new_board = community_cards + [card]
        if len(new_board) >= 5:
            new_board = new_board[:5]
        
        if len(new_board) >= 3:
            new_value = evaluate_hand(hole_cards + new_board)
            if current_value is None or new_value > current_value:
                outs.append(card)
    
    return outs
