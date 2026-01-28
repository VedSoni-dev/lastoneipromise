"""Tests for game state and controller modules."""

import pytest
from poker_engine.card import Card, Deck, Rank, Suit, parse_hand
from poker_engine.player import PlayerState
from poker_engine.actions import Action, LegalActions
from poker_engine.game_state import GameState, GameConfig, Street
from poker_engine.game_controller import PokerGame, BaseAgent, HandResult
from typing import Tuple, List


class SimpleCallAgent(BaseAgent):
    """Agent that always calls/checks."""
    
    @property
    def name(self) -> str:
        return "CallBot"
    
    def get_action(self, game_state: GameState, legal_actions: LegalActions) -> Tuple[Action, int]:
        if legal_actions.can_check:
            return (Action.CHECK, 0)
        if legal_actions.can_call:
            return (Action.CALL, legal_actions.call_amount)
        return (Action.FOLD, 0)


class SimpleFoldAgent(BaseAgent):
    """Agent that always folds."""
    
    @property
    def name(self) -> str:
        return "FoldBot"
    
    def get_action(self, game_state: GameState, legal_actions: LegalActions) -> Tuple[Action, int]:
        return (Action.FOLD, 0)


class TestGameState:
    """Tests for GameState class."""
    
    def test_create_game_state(self):
        """Test creating a basic game state."""
        players = [
            PlayerState(player_id=0, stack=1000),
            PlayerState(player_id=1, stack=1000),
        ]
        state = GameState(players=players)
        
        assert state.num_players == 2
        assert state.pot == 0
        assert state.street == Street.PREFLOP
    
    def test_legal_actions_preflop(self):
        """Test legal actions calculation."""
        players = [
            PlayerState(player_id=0, stack=1000, current_bet=20),
            PlayerState(player_id=1, stack=1000, current_bet=10),
        ]
        state = GameState(
            players=players,
            current_bet=20,
            current_player_idx=1,
        )
        
        legal = state.get_legal_actions(1)
        
        assert legal.can_fold
        assert legal.call_amount == 10  # Call 10 to match 20
        assert legal.can_call
    
    def test_serialization(self):
        """Test JSON serialization/deserialization."""
        players = [
            PlayerState(player_id=0, stack=1000),
            PlayerState(player_id=1, stack=1000),
        ]
        state = GameState(players=players, pot=100)
        
        json_str = state.to_json()
        restored = GameState.from_json(json_str)
        
        assert restored.pot == 100
        assert len(restored.players) == 2
    
    def test_active_players(self):
        """Test active player tracking."""
        players = [
            PlayerState(player_id=0, stack=1000, folded=False),
            PlayerState(player_id=1, stack=1000, folded=True),
            PlayerState(player_id=2, stack=1000, folded=False),
        ]
        state = GameState(players=players)
        
        assert len(state.active_players) == 2


class TestPokerGame:
    """Tests for PokerGame controller."""
    
    def test_new_hand_deals_cards(self):
        """Test that new_hand deals hole cards."""
        game = PokerGame()
        players = [
            PlayerState(player_id=0, stack=1000),
            PlayerState(player_id=1, stack=1000),
        ]
        
        state = game.new_hand(players)
        
        assert len(players[0].hole_cards) == 2
        assert len(players[1].hole_cards) == 2
        assert state.pot > 0  # Blinds posted
    
    def test_new_hand_posts_blinds(self):
        """Test blind posting."""
        config = GameConfig(small_blind=5, big_blind=10)
        game = PokerGame(config=config)
        players = [
            PlayerState(player_id=0, stack=1000),
            PlayerState(player_id=1, stack=1000),
        ]
        
        state = game.new_hand(players)
        
        # In heads-up, button is SB
        assert state.pot == 15  # SB + BB
    
    def test_process_fold(self):
        """Test fold action processing."""
        game = PokerGame()
        players = [
            PlayerState(player_id=0, stack=1000),
            PlayerState(player_id=1, stack=1000),
        ]
        
        state = game.new_hand(players)
        current = state.current_player
        
        game.process_action(current.player_id, Action.FOLD)
        
        assert current.folded
    
    def test_process_call(self):
        """Test call action processing."""
        game = PokerGame()
        players = [
            PlayerState(player_id=0, stack=1000),
            PlayerState(player_id=1, stack=1000),
        ]
        
        state = game.new_hand(players)
        current = state.current_player
        initial_pot = state.pot
        
        game.process_action(current.player_id, Action.CALL)
        
        assert state.pot > initial_pot
    
    def test_play_hand_completes(self):
        """Test playing a complete hand with agents."""
        game = PokerGame(seed=42)
        players = [
            PlayerState(player_id=0, stack=1000),
            PlayerState(player_id=1, stack=1000),
        ]
        
        game.new_hand(players)
        
        agents = {
            0: SimpleCallAgent(),
            1: SimpleCallAgent(),
        }
        
        result = game.play_hand(agents)
        
        assert result is not None
        assert len(result.winners) >= 1
        assert sum(result.payouts.values()) > 0
    
    def test_fold_wins_pot(self):
        """Test that folding gives pot to remaining player."""
        game = PokerGame(seed=42)
        players = [
            PlayerState(player_id=0, stack=1000),
            PlayerState(player_id=1, stack=1000),
        ]
        
        game.new_hand(players)
        
        agents = {
            0: SimpleFoldAgent(),
            1: SimpleCallAgent(),
        }
        
        result = game.play_hand(agents)
        
        # Player 1 should win since player 0 folds
        assert 1 in result.winners
        assert not result.went_to_showdown
    
    def test_hand_history_recorded(self):
        """Test that hand history is recorded."""
        game = PokerGame(seed=42)
        players = [
            PlayerState(player_id=0, stack=1000),
            PlayerState(player_id=1, stack=1000),
        ]
        
        game.new_hand(players)
        
        agents = {
            0: SimpleCallAgent(),
            1: SimpleCallAgent(),
        }
        
        game.play_hand(agents)
        history = game.get_hand_history()
        
        assert history is not None
        assert len(history.actions) > 0
        assert history.result is not None


class TestLegalActions:
    """Tests for legal action validation."""
    
    def test_validate_fold(self):
        """Test fold validation."""
        legal = LegalActions(can_fold=True)
        valid, msg = legal.validate_action(Action.FOLD)
        assert valid
    
    def test_validate_check_when_allowed(self):
        """Test check validation when no bet to call."""
        legal = LegalActions(can_check=True)
        valid, msg = legal.validate_action(Action.CHECK)
        assert valid
    
    def test_validate_check_when_not_allowed(self):
        """Test check validation when there's a bet."""
        legal = LegalActions(can_check=False, call_amount=20)
        valid, msg = legal.validate_action(Action.CHECK)
        assert not valid
    
    def test_validate_bet_in_range(self):
        """Test bet validation within range."""
        legal = LegalActions(min_bet=20, max_bet=100)
        valid, msg = legal.validate_action(Action.BET, 50)
        assert valid
    
    def test_validate_bet_below_min(self):
        """Test bet below minimum."""
        legal = LegalActions(min_bet=20, max_bet=100)
        valid, msg = legal.validate_action(Action.BET, 10)
        assert not valid


class TestEventCallbacks:
    """Tests for event system."""
    
    def test_hand_start_callback(self):
        """Test on_hand_start callback fires."""
        events = []
        
        game = PokerGame()
        game.on_hand_start(lambda state: events.append(("start", state)))
        
        players = [
            PlayerState(player_id=0, stack=1000),
            PlayerState(player_id=1, stack=1000),
        ]
        
        game.new_hand(players)
        
        assert len(events) == 1
        assert events[0][0] == "start"
    
    def test_action_callback(self):
        """Test on_action_taken callback fires."""
        events = []
        
        game = PokerGame()
        game.on_action_taken(lambda pid, action, amt: events.append((pid, action, amt)))
        
        players = [
            PlayerState(player_id=0, stack=1000),
            PlayerState(player_id=1, stack=1000),
        ]
        
        state = game.new_hand(players)
        current = state.current_player
        game.process_action(current.player_id, Action.CALL)
        
        assert len(events) >= 1
