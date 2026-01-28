"""
Demo script for the poker engine.

Run with: python -m poker_engine.demo
"""

from poker_engine.card import Card, Deck, Rank, Suit, parse_hand
from poker_engine.player import PlayerState
from poker_engine.actions import Action, LegalActions
from poker_engine.game_state import GameState, GameConfig, Street
from poker_engine.game_controller import PokerGame, BaseAgent, HandResult
from poker_engine.hand_evaluator import evaluate_hand, hand_strength
from poker_engine.info_set import InfoSet, canonicalize_hole_cards, get_hand_bucket
from typing import Tuple, List
import random


class RandomAgent(BaseAgent):
    """Agent that makes random legal moves."""
    
    def __init__(self, name: str = "RandomBot"):
        self._name = name
    
    @property
    def name(self) -> str:
        return self._name
    
    def get_action(self, game_state: GameState, legal_actions: LegalActions) -> Tuple[Action, int]:
        actions = legal_actions.get_actions()
        action = random.choice(actions)
        
        if action == Action.BET:
            amount = random.randint(legal_actions.min_bet, legal_actions.max_bet)
            return (action, amount)
        elif action == Action.RAISE:
            amount = random.randint(legal_actions.min_raise, legal_actions.max_raise)
            return (action, amount)
        elif action == Action.ALL_IN:
            return (action, legal_actions.all_in_amount)
        else:
            return (action, 0)


class TightAgent(BaseAgent):
    """Agent that plays tight - only strong hands."""
    
    def __init__(self, name: str = "TightBot"):
        self._name = name
        self._hole_cards: List[Card] = []
    
    @property
    def name(self) -> str:
        return self._name
    
    def on_hand_start(self, position: int, hole_cards: List[Card]) -> None:
        self._hole_cards = hole_cards
    
    def get_action(self, game_state: GameState, legal_actions: LegalActions) -> Tuple[Action, int]:
        # Get hand bucket (lower = stronger for preflop)
        if not self._hole_cards:
            # Defensive - shouldn't happen
            if legal_actions.can_check:
                return (Action.CHECK, 0)
            return (Action.FOLD, 0)
        
        # Calculate hand strength
        canonical = canonicalize_hole_cards(self._hole_cards)
        
        # Premium hands: raise
        premium = ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo']
        strong = ['TT', '99', 'AQs', 'AQo', 'AJs', 'KQs']
        
        if canonical in premium:
            if legal_actions.can_raise:
                # Raise to 3x
                raise_to = min(legal_actions.max_raise, game_state.current_bet * 3 or legal_actions.min_raise * 3)
                return (Action.RAISE, max(legal_actions.min_raise, raise_to))
            elif legal_actions.can_bet:
                bet_amount = min(legal_actions.max_bet, game_state.pot)
                return (Action.BET, max(legal_actions.min_bet, bet_amount))
            elif legal_actions.can_call:
                return (Action.CALL, 0)
            return (Action.CHECK, 0) if legal_actions.can_check else (Action.FOLD, 0)
        
        if canonical in strong:
            if legal_actions.can_call:
                return (Action.CALL, 0)
            return (Action.CHECK, 0) if legal_actions.can_check else (Action.FOLD, 0)
        
        # Weak hands: check or fold
        if legal_actions.can_check:
            return (Action.CHECK, 0)
        return (Action.FOLD, 0)


def demo_hand_evaluation():
    """Demonstrate hand evaluation."""
    print("=" * 60)
    print("HAND EVALUATION DEMO")
    print("=" * 60)
    
    # Test various hands
    hands = [
        ("Royal Flush", "As Ks Qs Js 10s"),
        ("Straight Flush", "9h 8h 7h 6h 5h"),
        ("Four of a Kind", "As Ah Ad Ac Kh"),
        ("Full House", "Ks Kh Kd Qs Qh"),
        ("Flush", "As 9s 7s 4s 2s"),
        ("Straight", "9c 8h 7d 6s 5c"),
        ("Three of a Kind", "Js Jh Jd As Kc"),
        ("Two Pair", "As Ah Ks Kh Qd"),
        ("Pair", "As Ah Kd Qc Jh"),
        ("High Card", "As Kd Qc Jh 9s"),
    ]
    
    for name, hand_str in hands:
        cards = parse_hand(hand_str)
        result = evaluate_hand(cards)
        print(f"  {hand_str:25} -> {result.describe()}")
    
    print()


def demo_hand_strength():
    """Demonstrate Monte Carlo hand strength."""
    print("=" * 60)
    print("HAND STRENGTH SIMULATION")
    print("=" * 60)
    
    hands_to_test = [
        ("Pocket Aces", "As Ah"),
        ("Pocket Kings", "Ks Kh"),
        ("Ace-King suited", "As Ks"),
        ("Pocket Tens", "10s 10h"),
        ("Ace-Queen offsuit", "Ah Qd"),
        ("7-2 offsuit", "7h 2d"),
    ]
    
    print("\nPreflop equity vs 1 random opponent (1000 simulations):")
    for name, hand_str in hands_to_test:
        cards = parse_hand(hand_str)
        equity = hand_strength(cards, [], num_opponents=1, simulations=1000)
        print(f"  {name:20} ({hand_str:6}): {equity:.1%}")
    
    print()


def demo_game_play():
    """Demonstrate a complete game."""
    print("=" * 60)
    print("COMPLETE GAME DEMO")
    print("=" * 60)
    
    # Create game
    config = GameConfig(small_blind=10, big_blind=20)
    game = PokerGame(config=config, seed=42)
    
    # Create players
    players = [
        PlayerState(player_id=0, stack=1000, name="TightPlayer"),
        PlayerState(player_id=1, stack=1000, name="RandomPlayer"),
    ]
    
    # Create agents
    agents = {
        0: TightAgent("TightPlayer"),
        1: RandomAgent("RandomPlayer"),
    }
    
    # Play 5 hands
    for hand_num in range(1, 6):
        print(f"\n--- Hand {hand_num} ---")
        
        # Reset stacks if needed
        for p in players:
            if p.stack <= 0:
                p.stack = 1000
                print(f"  {p.name} reloaded to 1000 chips")
        
        # Start new hand
        state = game.new_hand(players)
        
        print(f"  Button: Player {state.button_position}")
        print(f"  Pot: {state.pot}")
        
        for p in players:
            canonical = canonicalize_hole_cards(p.hole_cards)
            print(f"  {p.name}: {p.hole_cards[0]} {p.hole_cards[1]} ({canonical})")
        
        # Play hand
        result = game.play_hand(agents)
        
        # Print result
        if result.went_to_showdown:
            print(f"  Showdown!")
            for pid, value in result.hand_values.items():
                if value:
                    print(f"    Player {pid}: {value.describe()}")
        
        winners = [p.name for p in players if p.player_id in result.winners]
        print(f"  Winner(s): {', '.join(winners)}")
        print(f"  Payouts: {result.payouts}")
        
        # Current stacks
        print(f"  Stacks: {[f'{p.name}={p.stack}' for p in players]}")
    
    print()


def demo_info_set():
    """Demonstrate information abstraction."""
    print("=" * 60)
    print("INFORMATION ABSTRACTION DEMO")
    print("=" * 60)
    
    # Show canonical hand forms
    print("\nCanonical hand representations:")
    test_hands = [
        "As Ah",   # Pair
        "Ks Kh",
        "As Ks",   # Suited
        "As Kh",   # Offsuit
        "10s 10h", # Pair of tens
    ]
    
    for hand_str in test_hands:
        cards = parse_hand(hand_str)
        canonical = canonicalize_hole_cards(cards)
        bucket = get_hand_bucket(cards, [])
        print(f"  {hand_str:10} -> {canonical:4} (bucket {bucket})")
    
    print()


def main():
    """Run all demos."""
    print("\n" + "=" * 60)
    print("POKER ENGINE DEMO")
    print("=" * 60 + "\n")
    
    demo_hand_evaluation()
    demo_hand_strength()
    demo_info_set()
    demo_game_play()
    
    print("=" * 60)
    print("Demo complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
