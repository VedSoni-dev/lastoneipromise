"""
PokerGame - Game flow controller that manages complete hand flow.

Handles dealing, betting rounds, side pots, and showdown.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Callable, Tuple, Any
from abc import ABC, abstractmethod
import json

from .card import Card, Deck
from .player import PlayerState
from .actions import Action, PlayerAction, LegalActions
from .game_state import GameState, GameConfig, Street
from .hand_evaluator import evaluate_hand, HandValue


@dataclass
class HandResult:
    """Result of a completed hand."""
    winners: List[int]  # Player IDs of winners
    payouts: Dict[int, int]  # Player ID -> amount won
    hand_values: Dict[int, HandValue]  # Player ID -> final hand
    went_to_showdown: bool
    
    def to_dict(self) -> dict:
        return {
            'winners': self.winners,
            'payouts': self.payouts,
            'hand_values': {k: str(v) for k, v in self.hand_values.items()},
            'went_to_showdown': self.went_to_showdown,
        }


@dataclass
class HandHistoryEntry:
    """A single action in hand history."""
    street: Street
    player_id: int
    action: Action
    amount: int
    pot_after: int
    timestamp: float = 0.0
    
    def to_dict(self) -> dict:
        return {
            'street': self.street.name,
            'player_id': self.player_id,
            'action': self.action.name,
            'amount': self.amount,
            'pot_after': self.pot_after,
        }


@dataclass
class HandHistory:
    """Complete history of a hand."""
    hand_number: int
    players: List[Dict]  # Initial player states
    hole_cards: Dict[int, List[Card]]  # Player ID -> hole cards
    community_cards: List[Card]
    actions: List[HandHistoryEntry] = field(default_factory=list)
    result: Optional[HandResult] = None
    
    def add_action(self, entry: HandHistoryEntry):
        self.actions.append(entry)
    
    def to_dict(self) -> dict:
        return {
            'hand_number': self.hand_number,
            'players': self.players,
            'hole_cards': {k: [c.to_dict() for c in v] for k, v in self.hole_cards.items()},
            'community_cards': [c.to_dict() for c in self.community_cards],
            'actions': [a.to_dict() for a in self.actions],
            'result': self.result.to_dict() if self.result else None,
        }
    
    def to_json(self) -> str:
        return json.dumps(self.to_dict(), indent=2)


class BaseAgent(ABC):
    """Abstract base class for poker agents."""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Agent name for display."""
        pass
    
    @abstractmethod
    def get_action(self, game_state: GameState, legal_actions: LegalActions) -> Tuple[Action, int]:
        """
        Decide on an action given the current game state.
        
        Args:
            game_state: Current game state (cards hidden based on viewer).
            legal_actions: Available legal actions.
            
        Returns:
            Tuple of (Action, amount). Amount is 0 for fold/check/call.
        """
        pass
    
    def on_hand_start(self, position: int, hole_cards: List[Card]) -> None:
        """Called at the start of each hand."""
        pass
    
    def on_hand_end(self, result: HandResult) -> None:
        """Called at the end of each hand for learning agents."""
        pass
    
    def on_action(self, player_id: int, action: Action, amount: int) -> None:
        """Called when any player takes an action."""
        pass


class PokerGame:
    """
    Game controller for Texas Hold'em No-Limit.
    
    Manages complete hand flow including:
    - Dealing cards
    - Processing actions
    - Advancing betting rounds
    - Determining winners
    - Side pot handling
    """
    
    def __init__(self, config: Optional[GameConfig] = None, seed: Optional[int] = None):
        """
        Initialize a poker game.
        
        Args:
            config: Game configuration (blinds, player limits, etc.)
            seed: Random seed for reproducibility.
        """
        self.config = config or GameConfig()
        self.seed = seed
        self.deck = Deck(seed=seed)
        self.state: Optional[GameState] = None
        self.history: Optional[HandHistory] = None
        self.hand_count = 0
        
        # Event callbacks
        self._on_hand_start: List[Callable[[GameState], None]] = []
        self._on_player_turn: List[Callable[[int, LegalActions], None]] = []
        self._on_action_taken: List[Callable[[int, Action, int], None]] = []
        self._on_street_change: List[Callable[[Street, List[Card]], None]] = []
        self._on_hand_end: List[Callable[[HandResult], None]] = []
        self._on_showdown: List[Callable[[Dict[int, List[Card]]], None]] = []
    
    # Event registration methods
    def on_hand_start(self, callback: Callable[[GameState], None]):
        self._on_hand_start.append(callback)
    
    def on_player_turn(self, callback: Callable[[int, LegalActions], None]):
        self._on_player_turn.append(callback)
    
    def on_action_taken(self, callback: Callable[[int, Action, int], None]):
        self._on_action_taken.append(callback)
    
    def on_street_change(self, callback: Callable[[Street, List[Card]], None]):
        self._on_street_change.append(callback)
    
    def on_hand_end(self, callback: Callable[[HandResult], None]):
        self._on_hand_end.append(callback)
    
    def on_showdown(self, callback: Callable[[Dict[int, List[Card]]], None]):
        self._on_showdown.append(callback)
    
    def _emit_hand_start(self, state: GameState):
        for cb in self._on_hand_start:
            cb(state)
    
    def _emit_player_turn(self, player_id: int, legal: LegalActions):
        for cb in self._on_player_turn:
            cb(player_id, legal)
    
    def _emit_action_taken(self, player_id: int, action: Action, amount: int):
        for cb in self._on_action_taken:
            cb(player_id, action, amount)
    
    def _emit_street_change(self, street: Street, cards: List[Card]):
        for cb in self._on_street_change:
            cb(street, cards)
    
    def _emit_hand_end(self, result: HandResult):
        for cb in self._on_hand_end:
            cb(result)
    
    def _emit_showdown(self, hands: Dict[int, List[Card]]):
        for cb in self._on_showdown:
            cb(hands)
    
    def new_hand(self, players: List[PlayerState]) -> GameState:
        """
        Start a new hand.
        
        Args:
            players: List of players (will be modified in place).
            
        Returns:
            Initial game state.
        """
        if len(players) < self.config.min_players:
            raise ValueError(f"Need at least {self.config.min_players} players")
        if len(players) > self.config.max_players:
            raise ValueError(f"Maximum {self.config.max_players} players")
        
        # Reset players for new hand
        for i, player in enumerate(players):
            player.reset_for_new_hand()
            player.position = i
        
        # Reset and shuffle deck
        self.deck.reset()
        
        # Create game state
        self.hand_count += 1
        self.state = GameState(
            players=players,
            config=self.config,
            hand_number=self.hand_count,
            button_position=self.hand_count % len(players),
        )
        
        # Initialize history
        self.history = HandHistory(
            hand_number=self.hand_count,
            players=[p.to_dict() for p in players],
            hole_cards={},
            community_cards=[],
        )
        
        # Deal hole cards
        for player in players:
            player.hole_cards = self.deck.deal(2)
            self.history.hole_cards[player.player_id] = player.hole_cards.copy()
        
        # Post blinds
        self._post_blinds()
        
        # Set first player to act (left of big blind)
        if len(players) == 2:
            # Heads-up: button acts first preflop
            self.state.current_player_idx = self.state.button_position
        else:
            # First to act is left of big blind
            self.state.current_player_idx = (self.state.big_blind_position + 1) % len(players)
        
        self._emit_hand_start(self.state)
        
        return self.state
    
    def _post_blinds(self):
        """Post small and big blinds."""
        players = self.state.players
        
        # Small blind
        sb_player = players[self.state.small_blind_position]
        sb_amount = sb_player.bet(self.config.small_blind)
        self.state.pot += sb_amount
        
        # Big blind
        bb_player = players[self.state.big_blind_position]
        bb_amount = bb_player.bet(self.config.big_blind)
        self.state.pot += bb_amount
        
        self.state.current_bet = self.config.big_blind
        self.state.min_raise = self.config.big_blind
    
    def process_action(self, player_id: int, action: Action, amount: int = 0) -> bool:
        """
        Process a player action.
        
        Args:
            player_id: ID of the acting player.
            action: The action type.
            amount: Bet/raise amount (ignored for fold/check/call).
            
        Returns:
            True if action was valid and processed.
            
        Raises:
            ValueError: If action is invalid.
        """
        if self.state is None:
            raise ValueError("No active hand")
        
        # Find player
        player_idx = self.state.get_player_position(player_id)
        if player_idx is None:
            raise ValueError(f"Player {player_id} not found")
        
        if player_idx != self.state.current_player_idx:
            raise ValueError(f"Not player {player_id}'s turn")
        
        player = self.state.players[player_idx]
        legal = self.state.get_legal_actions(player_idx)
        
        # Validate action
        valid, error = legal.validate_action(action, amount)
        if not valid:
            raise ValueError(error)
        
        # Execute action
        actual_amount = 0
        
        if action == Action.FOLD:
            player.fold()
        
        elif action == Action.CHECK:
            pass  # No chips involved
        
        elif action == Action.CALL:
            call_amount = self.state.current_bet - player.current_bet
            actual_amount = player.bet(min(call_amount, player.stack))
            self.state.pot += actual_amount
        
        elif action == Action.BET:
            actual_amount = player.bet(amount)
            self.state.pot += actual_amount
            self.state.current_bet = player.current_bet
            self.state.min_raise = amount
            self.state.last_raiser_idx = player_idx
        
        elif action == Action.RAISE:
            # Amount is the total raise TO, not raise BY
            raise_to = amount
            raise_amount = raise_to - player.current_bet
            actual_amount = player.bet(raise_amount)
            self.state.pot += actual_amount
            raise_size = player.current_bet - self.state.current_bet
            self.state.current_bet = player.current_bet
            self.state.min_raise = raise_size
            self.state.last_raiser_idx = player_idx
        
        elif action == Action.ALL_IN:
            actual_amount = player.bet(player.stack)
            self.state.pot += actual_amount
            if player.current_bet > self.state.current_bet:
                raise_size = player.current_bet - self.state.current_bet
                self.state.current_bet = player.current_bet
                self.state.min_raise = max(self.state.min_raise, raise_size)
                self.state.last_raiser_idx = player_idx
        
        # Record action
        history_entry = HandHistoryEntry(
            street=self.state.street,
            player_id=player_id,
            action=action,
            amount=actual_amount,
            pot_after=self.state.pot,
        )
        self.history.add_action(history_entry)
        self.state.actions_this_street.append(PlayerAction(action, actual_amount, player_id))
        
        self._emit_action_taken(player_id, action, actual_amount)
        
        # Advance to next player or next street
        self._advance_game()
        
        return True
    
    def _advance_game(self):
        """Advance to next player or next betting round."""
        # Check if hand is complete
        if len(self.state.active_players) <= 1:
            self._end_hand()
            return
        
        # Check if betting is complete
        if self.state.is_betting_complete():
            if self.state.street == Street.RIVER:
                self._end_hand()
            else:
                self._advance_street()
        else:
            # Move to next player
            next_idx = self.state.next_active_player(self.state.current_player_idx)
            if next_idx is not None:
                self.state.current_player_idx = next_idx
                player = self.state.players[next_idx]
                legal = self.state.get_legal_actions(next_idx)
                self._emit_player_turn(player.player_id, legal)
    
    def _advance_street(self):
        """Deal next community cards and start new betting round."""
        # Reset betting for new round
        for player in self.state.players:
            player.reset_for_new_round()
        
        self.state.current_bet = 0
        self.state.min_raise = self.config.big_blind
        self.state.last_raiser_idx = None
        self.state.actions_this_street = []
        
        # Deal community cards
        new_cards = []
        
        if self.state.street == Street.PREFLOP:
            # Deal flop (3 cards)
            self.deck.burn()
            new_cards = self.deck.deal(3)
            self.state.community_cards = new_cards
            self.state.street = Street.FLOP
        
        elif self.state.street == Street.FLOP:
            # Deal turn (1 card)
            self.deck.burn()
            new_cards = self.deck.deal(1)
            self.state.community_cards.extend(new_cards)
            self.state.street = Street.TURN
        
        elif self.state.street == Street.TURN:
            # Deal river (1 card)
            self.deck.burn()
            new_cards = self.deck.deal(1)
            self.state.community_cards.extend(new_cards)
            self.state.street = Street.RIVER
        
        # Update history
        self.history.community_cards = self.state.community_cards.copy()
        
        self._emit_street_change(self.state.street, new_cards)
        
        # First to act is left of button
        first_active = None
        for i in range(1, self.state.num_players + 1):
            idx = (self.state.button_position + i) % self.state.num_players
            if self.state.players[idx].is_active:
                first_active = idx
                break
        
        if first_active is not None:
            self.state.current_player_idx = first_active
            player = self.state.players[first_active]
            legal = self.state.get_legal_actions(first_active)
            self._emit_player_turn(player.player_id, legal)
    
    def _end_hand(self):
        """Determine winners and distribute pot."""
        self.state.street = Street.SHOWDOWN
        
        active_players = self.state.active_players
        went_to_showdown = len(active_players) > 1
        
        # Calculate hand values
        hand_values = {}
        for player in active_players:
            all_cards = player.hole_cards + self.state.community_cards
            if len(all_cards) >= 5:
                hand_values[player.player_id] = evaluate_hand(all_cards)
            else:
                # Handle preflop all-in
                hand_values[player.player_id] = None
        
        if went_to_showdown:
            # Emit showdown event
            revealed = {p.player_id: p.hole_cards for p in active_players}
            self._emit_showdown(revealed)
        
        # Calculate payouts (simplified - no side pots for now)
        payouts = {}
        winners = []
        
        if len(active_players) == 1:
            # Everyone else folded
            winner = active_players[0]
            winners = [winner.player_id]
            payouts[winner.player_id] = self.state.pot
            winner.win(self.state.pot)
        else:
            # Find best hand(s)
            best_value = max(v for v in hand_values.values() if v is not None)
            winners = [pid for pid, v in hand_values.items() if v == best_value]
            
            # Split pot among winners
            share = self.state.pot // len(winners)
            remainder = self.state.pot % len(winners)
            
            for i, winner_id in enumerate(winners):
                amount = share + (1 if i < remainder else 0)
                payouts[winner_id] = amount
                for p in self.state.players:
                    if p.player_id == winner_id:
                        p.win(amount)
                        break
        
        result = HandResult(
            winners=winners,
            payouts=payouts,
            hand_values=hand_values,
            went_to_showdown=went_to_showdown,
        )
        
        self.history.result = result
        self._emit_hand_end(result)
    
    def play_hand(self, agents: Dict[int, BaseAgent]) -> HandResult:
        """
        Play a complete hand using agent decision-making.
        
        Args:
            agents: Dictionary mapping player_id to agent.
            
        Returns:
            Result of the hand.
        """
        if self.state is None:
            raise ValueError("Must call new_hand() first")
        
        # Notify agents of hand start
        for player in self.state.players:
            if player.player_id in agents:
                agents[player.player_id].on_hand_start(
                    player.position,
                    player.hole_cards
                )
        
        # Play until hand is complete
        while not self.state.is_hand_complete():
            current = self.state.current_player
            if current is None:
                break
            
            player_id = current.player_id
            
            if player_id not in agents:
                raise ValueError(f"No agent for player {player_id}")
            
            agent = agents[player_id]
            legal = self.state.get_legal_actions()
            
            # Get agent's decision
            action, amount = agent.get_action(
                self.state.copy(),  # Don't expose full state
                legal
            )
            
            # Process the action
            self.process_action(player_id, action, amount)
            
            # Notify other agents
            for pid, a in agents.items():
                a.on_action(player_id, action, amount)
        
        # Notify agents of hand end
        for agent in agents.values():
            agent.on_hand_end(self.history.result)
        
        return self.history.result
    
    def get_hand_history(self) -> Optional[HandHistory]:
        """Get the history of the current/last hand."""
        return self.history
