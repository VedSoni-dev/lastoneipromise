"""Tests for hand evaluator module."""

import pytest
from poker_engine.card import Card, Rank, Suit, parse_hand
from poker_engine.hand_evaluator import (
    evaluate_hand, HandRank, HandValue, hand_strength, 
    best_five_from_seven, hand_potential, get_outs
)


class TestHandEvaluation:
    """Tests for hand evaluation."""
    
    def test_high_card(self):
        """Test high card detection."""
        cards = parse_hand("As Kd Qc Jh 9s")
        result = evaluate_hand(cards)
        assert result.rank == HandRank.HIGH_CARD
        assert result.kickers[0] == 14  # Ace high
    
    def test_pair(self):
        """Test pair detection."""
        cards = parse_hand("As Ah Kd Qc Jh")
        result = evaluate_hand(cards)
        assert result.rank == HandRank.PAIR
        assert result.kickers[0] == 14  # Pair of aces
    
    def test_two_pair(self):
        """Test two pair detection."""
        cards = parse_hand("As Ah Ks Kh Qd")
        result = evaluate_hand(cards)
        assert result.rank == HandRank.TWO_PAIR
        assert result.kickers[0] == 14  # Aces
        assert result.kickers[1] == 13  # Kings
    
    def test_three_of_a_kind(self):
        """Test three of a kind detection."""
        cards = parse_hand("As Ah Ad Kc Qh")
        result = evaluate_hand(cards)
        assert result.rank == HandRank.THREE_OF_A_KIND
        assert result.kickers[0] == 14
    
    def test_straight(self):
        """Test straight detection."""
        cards = parse_hand("9s 8h 7d 6c 5s")
        result = evaluate_hand(cards)
        assert result.rank == HandRank.STRAIGHT
        assert result.kickers[0] == 9  # 9-high straight
    
    def test_wheel_straight(self):
        """Test A-2-3-4-5 straight (wheel)."""
        cards = parse_hand("As 2h 3d 4c 5s")
        result = evaluate_hand(cards)
        assert result.rank == HandRank.STRAIGHT
        assert result.kickers[0] == 5  # 5-high straight
    
    def test_broadway_straight(self):
        """Test A-K-Q-J-10 straight (broadway)."""
        cards = parse_hand("As Kh Qd Jc 10s")
        result = evaluate_hand(cards)
        assert result.rank == HandRank.STRAIGHT
        assert result.kickers[0] == 14  # Ace-high straight
    
    def test_flush(self):
        """Test flush detection."""
        cards = parse_hand("As Ks Qs Js 9s")
        result = evaluate_hand(cards)
        assert result.rank == HandRank.FLUSH
    
    def test_full_house(self):
        """Test full house detection."""
        cards = parse_hand("As Ah Ad Ks Kh")
        result = evaluate_hand(cards)
        assert result.rank == HandRank.FULL_HOUSE
        assert result.kickers[0] == 14  # Aces full
        assert result.kickers[1] == 13  # of Kings
    
    def test_four_of_a_kind(self):
        """Test four of a kind detection."""
        cards = parse_hand("As Ah Ad Ac Kh")
        result = evaluate_hand(cards)
        assert result.rank == HandRank.FOUR_OF_A_KIND
    
    def test_straight_flush(self):
        """Test straight flush detection."""
        cards = parse_hand("9s 8s 7s 6s 5s")
        result = evaluate_hand(cards)
        assert result.rank == HandRank.STRAIGHT_FLUSH
    
    def test_royal_flush(self):
        """Test royal flush detection."""
        cards = parse_hand("As Ks Qs Js 10s")
        result = evaluate_hand(cards)
        assert result.rank == HandRank.ROYAL_FLUSH


class TestHandComparison:
    """Tests for comparing hands."""
    
    def test_higher_rank_wins(self):
        """Higher rank hands beat lower ranks."""
        pair = evaluate_hand(parse_hand("As Ah Kd Qc Jh"))
        two_pair = evaluate_hand(parse_hand("As Ah Ks Kh Qd"))
        
        assert two_pair > pair
    
    def test_higher_kicker_wins(self):
        """Same rank, higher kicker wins."""
        pair_kings = evaluate_hand(parse_hand("Ks Kh Qd Jc 9h"))
        pair_aces = evaluate_hand(parse_hand("As Ah Kd Qc Jh"))
        
        assert pair_aces > pair_kings
    
    def test_same_hands_equal(self):
        """Identical hands are equal."""
        hand1 = evaluate_hand(parse_hand("As Ah Kd Qc Jh"))
        hand2 = evaluate_hand(parse_hand("Ac Ad Ks Qh Js"))
        
        assert hand1 == hand2


class TestBestFiveFromSeven:
    """Tests for finding best 5 cards from 7."""
    
    def test_extracts_best_hand(self):
        """Find the best 5-card hand from 7 cards."""
        hole = parse_hand("As Ks")
        board = parse_hand("Qs Js 10s 2h 3d")
        
        result = best_five_from_seven(hole, board)
        assert result.rank == HandRank.ROYAL_FLUSH
    
    def test_uses_board_cards(self):
        """Sometimes best hand uses few hole cards."""
        hole = parse_hand("2h 3d")
        board = parse_hand("As Ks Qs Js 10s")
        
        result = best_five_from_seven(hole, board)
        assert result.rank == HandRank.ROYAL_FLUSH


class TestHandStrength:
    """Tests for Monte Carlo hand strength."""
    
    def test_pocket_aces_strong(self):
        """Pocket aces should have high equity."""
        hole = parse_hand("As Ah")
        strength = hand_strength(hole, [], num_opponents=1, simulations=500)
        assert strength > 0.8  # Should win >80% vs random hand
    
    def test_72_offsuit_weak(self):
        """7-2 offsuit should be weak."""
        hole = parse_hand("7h 2s")
        strength = hand_strength(hole, [], num_opponents=1, simulations=500)
        assert strength < 0.4  # Should be below average
    
    def test_reproducible_with_seed(self):
        """Same seed should give same result."""
        hole = parse_hand("As Kh")
        s1 = hand_strength(hole, [], simulations=100, seed=42)
        s2 = hand_strength(hole, [], simulations=100, seed=42)
        assert s1 == s2


class TestHandPotential:
    """Tests for drawing hand potential."""
    
    def test_flush_draw_has_potential(self):
        """Flush draw should have positive potential."""
        hole = parse_hand("As Ks")
        board = parse_hand("2s 5s 9h")
        
        pos_pot, neg_pot = hand_potential(hole, board, simulations=200, seed=42)
        assert pos_pot > 0.1  # Should improve often with flush draw


class TestPerformance:
    """Performance benchmarks."""
    
    def test_evaluation_speed(self, benchmark):
        """Benchmark hand evaluation speed."""
        cards = parse_hand("As Ks Qs Js 9s 8h 7d")
        
        def evaluate():
            return evaluate_hand(cards)
        
        result = benchmark(evaluate)
        # Benchmark will report iterations/second
