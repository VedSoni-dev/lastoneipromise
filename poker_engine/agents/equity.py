"""
Probability and Equity Engine

Comprehensive probability calculations for poker:
- Preflop equity calculations
- Hand range representation
- Postflop equity vs ranges
- Draw odds and outs calculation
- Expected value (EV) calculator
"""

from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass
import random
from itertools import combinations

from ..card import Card, Deck, Rank, Suit
from ..hand_evaluator import evaluate_hand, hand_strength, HandRank


# All 169 starting hands as canonical forms
ALL_STARTING_HANDS = [
    # Pairs
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22',
    # Suited hands
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s',
    'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s',
    'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s',
    'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s',
    '98s', '97s', '96s', '95s', '94s', '93s', '92s',
    '87s', '86s', '85s', '84s', '83s', '82s',
    '76s', '75s', '74s', '73s', '72s',
    '65s', '64s', '63s', '62s',
    '54s', '53s', '52s',
    '43s', '42s',
    '32s',
    # Offsuit hands
    'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o',
    'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'K7o', 'K6o', 'K5o', 'K4o', 'K3o', 'K2o',
    'QJo', 'QTo', 'Q9o', 'Q8o', 'Q7o', 'Q6o', 'Q5o', 'Q4o', 'Q3o', 'Q2o',
    'JTo', 'J9o', 'J8o', 'J7o', 'J6o', 'J5o', 'J4o', 'J3o', 'J2o',
    'T9o', 'T8o', 'T7o', 'T6o', 'T5o', 'T4o', 'T3o', 'T2o',
    '98o', '97o', '96o', '95o', '94o', '93o', '92o',
    '87o', '86o', '85o', '84o', '83o', '82o',
    '76o', '75o', '74o', '73o', '72o',
    '65o', '64o', '63o', '62o',
    '54o', '53o', '52o',
    '43o', '42o',
    '32o',
]

# Prebuilt ranges for common situations
RANGES = {
    'utg_open': {'AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'KQs'},
    'mp_open': {'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'AJo', 'ATs', 'KQs', 'KQo', 'KJs', 'QJs'},
    'co_open': {'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'AJo', 'ATs', 'ATo', 'A9s', 'KQs', 'KQo', 'KJs', 'KJo', 'KTs', 'QJs', 'QJo', 'QTs', 'JTs'},
    'btn_open': {'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'AJo', 'ATs', 'ATo', 'A9s', 'A9o', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KJo', 'KTs', 'KTo', 'K9s', 'QJs', 'QJo', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', '98s', '87s', '76s'},
    'sb_open': {'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'AJo', 'ATs', 'A9s', 'A8s', 'KQs', 'KQo', 'KJs', 'KTs', 'QJs', 'JTs'},
    'bb_defend': {'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'AJo', 'ATs', 'ATo', 'A9s', 'A9o', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KQo', 'KJs', 'KJo', 'KTs', 'K9s', 'K8s', 'QJs', 'QJo', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '76s', '65s', '54s'},
    'premium': {'AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo'},
    'top_10_percent': {'AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'KQs'},
    'top_20_percent': {'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'AJo', 'ATs', 'ATo', 'A9s', 'KQs', 'KQo', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs'},
}


@dataclass
class HandRange:
    """
    Represents a range of poker hands.
    
    Can parse string representations like "AA,KK,QQ,AKs" or
    ranges like "TT+" (TT and all higher pairs).
    """
    hands: Set[str]
    weights: Dict[str, float] = None  # Optional weights per hand
    
    def __init__(self, hands: Optional[Set[str]] = None, weights: Optional[Dict[str, float]] = None):
        self.hands = hands or set()
        self.weights = weights or {}
    
    @classmethod
    def from_string(cls, range_str: str) -> 'HandRange':
        """
        Parse a range string.
        
        Examples:
            "AA,KK,QQ" - specific hands
            "AA:1.0,KK:0.5" - weighted range
            "TT+" - pairs TT and above
            "ATs+" - suited aces AT and above
        """
        hands = set()
        weights = {}
        
        parts = [p.strip() for p in range_str.split(',')]
        
        for part in parts:
            if ':' in part:
                # Weighted hand
                hand, weight = part.split(':')
                hand = hand.strip()
                hands.add(hand)
                weights[hand] = float(weight)
            elif '+' in part:
                # Range notation
                base = part.replace('+', '')
                hands.update(cls._expand_plus_notation(base))
            else:
                hands.add(part)
        
        return cls(hands, weights)
    
    @classmethod
    def from_preset(cls, name: str) -> 'HandRange':
        """Create range from a preset name."""
        if name.lower() not in RANGES:
            raise ValueError(f"Unknown preset: {name}. Available: {list(RANGES.keys())}")
        return cls(RANGES[name.lower()].copy())
    
    @staticmethod
    def _expand_plus_notation(base: str) -> Set[str]:
        """Expand notation like 'TT+' or 'ATs+'."""
        result = set()
        rank_order = 'AKQJT98765432'
        
        if len(base) == 2 and base[0] == base[1]:
            # Pair notation: TT+
            pair_rank = base[0]
            idx = rank_order.index(pair_rank)
            for r in rank_order[:idx + 1]:
                result.add(f'{r}{r}')
        elif len(base) == 3 and base[2] in 'so':
            # Suited/offsuit notation: ATs+
            high = base[0]
            low = base[1]
            suited = base[2] == 's'
            suffix = 's' if suited else 'o'
            
            high_idx = rank_order.index(high)
            low_idx = rank_order.index(low)
            
            # Expand from base to AK
            for i in range(high_idx + 1, low_idx + 1):
                result.add(f'{high}{rank_order[i]}{suffix}')
        else:
            result.add(base)
        
        return result
    
    def contains(self, hand: str) -> bool:
        """Check if range contains a hand."""
        return hand in self.hands
    
    def get_weight(self, hand: str) -> float:
        """Get weight for a hand (1.0 if not specified)."""
        return self.weights.get(hand, 1.0)
    
    def to_combos(self) -> List[Tuple[Card, Card]]:
        """Convert range to all possible card combinations."""
        combos = []
        rank_map = {'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10,
                    '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2}
        
        for hand in self.hands:
            if len(hand) == 2:
                # Pair
                r = Rank(rank_map[hand[0]])
                for s1, s2 in combinations(Suit, 2):
                    combos.append((Card(r, s1), Card(r, s2)))
            elif len(hand) == 3:
                r1 = Rank(rank_map[hand[0]])
                r2 = Rank(rank_map[hand[1]])
                suited = hand[2] == 's'
                
                if suited:
                    for s in Suit:
                        combos.append((Card(r1, s), Card(r2, s)))
                else:
                    for s1 in Suit:
                        for s2 in Suit:
                            if s1 != s2:
                                combos.append((Card(r1, s1), Card(r2, s2)))
        
        return combos
    
    def __len__(self) -> int:
        return len(self.hands)
    
    def __repr__(self) -> str:
        return f"HandRange({len(self.hands)} hands)"


def calculate_preflop_equity(
    hand1: List[Card],
    hand2: List[Card],
    simulations: int = 10000,
    seed: Optional[int] = None
) -> Tuple[float, float, float]:
    """
    Calculate exact preflop equity between two hands.
    
    Returns:
        Tuple of (hand1_equity, hand2_equity, tie_equity)
    """
    rng = random.Random(seed)
    
    used = set(hand1) | set(hand2)
    all_cards = [Card(r, s) for s in Suit for r in Rank]
    available = [c for c in all_cards if c not in used]
    
    wins1 = wins2 = ties = 0
    
    for _ in range(simulations):
        rng.shuffle(available)
        board = available[:5]
        
        val1 = evaluate_hand(hand1 + board)
        val2 = evaluate_hand(hand2 + board)
        
        if val1 > val2:
            wins1 += 1
        elif val2 > val1:
            wins2 += 1
        else:
            ties += 1
    
    total = wins1 + wins2 + ties
    return (wins1 / total, wins2 / total, ties / total)


def calculate_equity_vs_range(
    hand: List[Card],
    opponent_range: HandRange,
    community_cards: Optional[List[Card]] = None,
    simulations_per_combo: int = 100,
    seed: Optional[int] = None
) -> float:
    """
    Calculate equity against a range of hands.
    
    Args:
        hand: Our hole cards.
        opponent_range: Range of opponent hands.
        community_cards: Optional board cards.
        simulations_per_combo: Simulations per opponent combo.
        
    Returns:
        Our equity (0.0 - 1.0).
    """
    rng = random.Random(seed)
    community = community_cards or []
    
    used = set(hand) | set(community)
    combos = [c for c in opponent_range.to_combos() 
              if c[0] not in used and c[1] not in used]
    
    if not combos:
        return 1.0
    
    total_equity = 0.0
    valid_combos = 0
    
    for opp_hand in combos:
        opp_cards = list(opp_hand)
        equity = hand_strength(
            hand, community, 
            num_opponents=1, 
            simulations=simulations_per_combo,
            seed=rng.randint(0, 1000000)
        )
        
        weight = opponent_range.get_weight(
            _cards_to_canonical(opp_cards)
        )
        total_equity += equity * weight
        valid_combos += weight
    
    return total_equity / valid_combos if valid_combos > 0 else 0.5


def _cards_to_canonical(cards: List[Card]) -> str:
    """Convert cards to canonical form."""
    c1, c2 = cards
    r1, r2 = c1.rank.value, c2.rank.value
    
    if r1 < r2:
        r1, r2 = r2, r1
        c1, c2 = c2, c1
    
    rank_symbols = {14: 'A', 13: 'K', 12: 'Q', 11: 'J', 10: 'T',
                    9: '9', 8: '8', 7: '7', 6: '6', 5: '5',
                    4: '4', 3: '3', 2: '2'}
    
    s1 = rank_symbols[r1]
    s2 = rank_symbols[r2]
    
    if r1 == r2:
        return f"{s1}{s2}"
    elif c1.suit == c2.suit:
        return f"{s1}{s2}s"
    else:
        return f"{s1}{s2}o"


@dataclass
class DrawInfo:
    """Information about a drawing hand."""
    has_flush_draw: bool = False
    flush_outs: int = 0
    has_straight_draw: bool = False
    straight_outs: int = 0
    has_open_ended: bool = False
    has_gutshot: bool = False
    total_outs: int = 0
    current_hand_rank: HandRank = HandRank.HIGH_CARD


def analyze_draws(hole_cards: List[Card], community_cards: List[Card]) -> DrawInfo:
    """
    Analyze a hand for drawing potential.
    
    Returns information about flush draws, straight draws, etc.
    """
    if len(community_cards) < 3:
        return DrawInfo()
    
    all_cards = hole_cards + community_cards
    info = DrawInfo()
    info.current_hand_rank = evaluate_hand(all_cards).rank
    
    # Flush draw check
    suit_counts = {}
    for c in all_cards:
        suit_counts[c.suit] = suit_counts.get(c.suit, 0) + 1
    
    for suit, count in suit_counts.items():
        if count == 4:
            info.has_flush_draw = True
            info.flush_outs = 9
            break
    
    # Straight draw check (simplified)
    ranks = sorted(set(c.rank.value for c in all_cards))
    
    # Check for 4 in a row (open-ended)
    for i in range(len(ranks) - 3):
        if ranks[i+3] - ranks[i] == 3:
            info.has_straight_draw = True
            info.has_open_ended = True
            info.straight_outs = 8
            break
    
    # Check for gutshot (4 cards with 1 gap)
    if not info.has_open_ended:
        for i in range(len(ranks) - 3):
            if ranks[i+3] - ranks[i] == 4:
                gaps = 0
                for j in range(i, i+3):
                    if ranks[j+1] - ranks[j] > 1:
                        gaps += 1
                if gaps == 1:
                    info.has_straight_draw = True
                    info.has_gutshot = True
                    info.straight_outs = 4
                    break
    
    # Calculate total outs (don't double count)
    info.total_outs = info.flush_outs + info.straight_outs
    if info.has_flush_draw and info.has_straight_draw:
        info.total_outs -= 2  # Some cards complete both
    
    return info


def calculate_pot_odds(pot: int, to_call: int) -> float:
    """Calculate pot odds as a ratio."""
    if to_call <= 0:
        return float('inf')
    return pot / to_call


def calculate_implied_odds(
    pot: int, 
    to_call: int, 
    expected_future_bets: int
) -> float:
    """Calculate implied odds including expected future winnings."""
    if to_call <= 0:
        return float('inf')
    return (pot + expected_future_bets) / to_call


def calculate_fold_equity(
    bluff_amount: int,
    pot: int,
    fold_probability: float
) -> float:
    """
    Calculate expected value from fold equity.
    
    Args:
        bluff_amount: Size of our bluff.
        pot: Current pot before bluff.
        fold_probability: Probability opponent folds (0-1).
        
    Returns:
        EV from fold equity alone.
    """
    win_when_fold = pot * fold_probability
    lose_when_call = bluff_amount * (1 - fold_probability)
    return win_when_fold - lose_when_call


def calculate_ev(
    win_probability: float,
    pot_if_win: int,
    cost: int
) -> float:
    """
    Calculate expected value of a call/bet.
    
    Args:
        win_probability: Probability of winning (0-1).
        pot_if_win: Amount won if we win.
        cost: Amount we're risking.
        
    Returns:
        Expected value.
    """
    return (win_probability * pot_if_win) - ((1 - win_probability) * cost)


def should_call_draw(
    outs: int,
    pot: int,
    to_call: int,
    cards_to_come: int = 1
) -> Tuple[bool, float, float]:
    """
    Determine if calling with a draw is profitable.
    
    Args:
        outs: Number of outs.
        pot: Current pot.
        to_call: Amount to call.
        cards_to_come: Cards left to come (1 for turn, 2 for flop).
        
    Returns:
        Tuple of (should_call, equity, odds_needed).
    """
    # Rule of 2 and 4
    if cards_to_come == 2:
        equity = outs * 4 / 100
    else:
        equity = outs * 2 / 100
    
    odds_needed = to_call / (pot + to_call) if pot + to_call > 0 else 0
    should_call = equity > odds_needed
    
    return (should_call, equity, odds_needed)
