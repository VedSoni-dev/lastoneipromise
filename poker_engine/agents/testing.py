"""
Agent Testing Framework

Comprehensive testing and benchmarking for poker agents:
- HeadsUpMatch: 1v1 agent battles
- TableMatch: 6-max or 9-max games
- Benchmark suite for agent evaluation
- Exploit detection
- Performance metrics and visualization
"""

from typing import Dict, List, Optional, Tuple, Any, Callable
from dataclasses import dataclass, field
import random
import time
from collections import defaultdict
import statistics

from .base_agent import BaseAgent, HandResult
from ..game_controller import PokerGame
from ..game_state import GameConfig
from ..player import PlayerState


@dataclass
class MatchResult:
    """Result of a match between agents."""
    hands_played: int
    chips_won: Dict[int, int]  # player_id -> chips won/lost
    bb_per_100: Dict[int, float]  # player_id -> bb/100
    showdowns: int
    folds: int
    all_ins: int
    duration_seconds: float
    hands_per_second: float
    
    def get_winner(self) -> Optional[int]:
        """Get ID of winning player (most chips won)."""
        if not self.chips_won:
            return None
        return max(self.chips_won.keys(), key=lambda k: self.chips_won[k])
    
    def to_dict(self) -> dict:
        return {
            'hands_played': self.hands_played,
            'chips_won': self.chips_won,
            'bb_per_100': self.bb_per_100,
            'showdowns': self.showdowns,
            'folds': self.folds,
            'all_ins': self.all_ins,
            'duration_seconds': round(self.duration_seconds, 2),
            'hands_per_second': round(self.hands_per_second, 2),
        }


@dataclass 
class AgentStats:
    """Cumulative statistics for an agent."""
    hands_played: int = 0
    hands_won: int = 0
    chips_won: int = 0
    vpip_hands: int = 0  # Voluntarily put money in pot
    pfr_hands: int = 0   # Preflop raise
    showdowns_won: int = 0
    showdowns_total: int = 0
    folds: int = 0
    all_ins: int = 0
    
    @property
    def vpip(self) -> float:
        """Voluntarily put money in pot percentage."""
        if self.hands_played == 0:
            return 0.0
        return self.vpip_hands / self.hands_played
    
    @property
    def pfr(self) -> float:
        """Preflop raise percentage."""
        if self.hands_played == 0:
            return 0.0
        return self.pfr_hands / self.hands_played
    
    @property
    def win_rate(self) -> float:
        """Hand win rate."""
        if self.hands_played == 0:
            return 0.0
        return self.hands_won / self.hands_played
    
    @property
    def showdown_win_rate(self) -> float:
        """Showdown win rate."""
        if self.showdowns_total == 0:
            return 0.0
        return self.showdowns_won / self.showdowns_total
    
    @property
    def aggression_factor(self) -> float:
        """Aggression factor (raises / calls)."""
        # Simplified - would need more tracking for accurate AF
        if self.folds == 0:
            return 1.0
        return self.pfr_hands / max(1, self.hands_played - self.pfr_hands - self.folds)


class HeadsUpMatch:
    """
    Heads-up (1v1) match between two agents.
    
    Runs a specified number of hands and tracks statistics.
    
    Example:
        match = HeadsUpMatch(agent1, agent2, num_hands=1000)
        result = match.run()
        print(f"Winner: {result.get_winner()}")
    """
    
    def __init__(
        self,
        agent1: BaseAgent,
        agent2: BaseAgent,
        num_hands: int = 1000,
        starting_stack: int = 1000,
        small_blind: int = 5,
        big_blind: int = 10,
        seed: Optional[int] = None,
        verbose: bool = False
    ):
        self.agent1 = agent1
        self.agent2 = agent2
        self.num_hands = num_hands
        self.starting_stack = starting_stack
        self.config = GameConfig(
            small_blind=small_blind,
            big_blind=big_blind,
            starting_stack=starting_stack
        )
        self.seed = seed
        self.verbose = verbose
        
        # Statistics
        self.stats: Dict[int, AgentStats] = {
            0: AgentStats(),
            1: AgentStats(),
        }
        self.chips_history: Dict[int, List[int]] = {0: [], 1: []}
    
    def run(self) -> MatchResult:
        """Run the match and return results."""
        start_time = time.time()
        
        game = PokerGame(self.config, seed=self.seed)
        
        # Create players with refreshing stacks
        players = [
            PlayerState(player_id=0, stack=self.starting_stack, name=self.agent1.name),
            PlayerState(player_id=1, stack=self.starting_stack, name=self.agent2.name),
        ]
        
        agents = {0: self.agent1, 1: self.agent2}
        self.agent1.player_id = 0
        self.agent2.player_id = 1
        
        total_chips_won = {0: 0, 1: 0}
        showdowns = 0
        folds = 0
        all_ins = 0
        
        for hand_num in range(self.num_hands):
            # Reset stacks for each hand
            for p in players:
                p.stack = self.starting_stack
                p.reset_for_new_hand()
            
            # Play hand
            try:
                state = game.new_hand(players)
                result = game.play_hand(agents)
                
                # Track statistics
                for pid, payout in result.payouts.items():
                    net = payout - self.starting_stack
                    total_chips_won[pid] += net
                    self.stats[pid].hands_played += 1
                    self.stats[pid].chips_won += net
                    if pid in result.winners:
                        self.stats[pid].hands_won += 1
                
                if result.went_to_showdown:
                    showdowns += 1
                    for pid in result.winners:
                        self.stats[pid].showdowns_won += 1
                    for pid in [0, 1]:
                        self.stats[pid].showdowns_total += 1
                else:
                    folds += 1
                
                # Track chip history
                for pid in [0, 1]:
                    self.chips_history[pid].append(total_chips_won[pid])
                
            except Exception as e:
                if self.verbose:
                    print(f"Hand {hand_num} error: {e}")
                continue
        
        duration = time.time() - start_time
        
        # Calculate bb/100
        bb = self.config.big_blind
        bb_per_100 = {
            pid: (chips / bb) / (self.num_hands / 100)
            for pid, chips in total_chips_won.items()
        }
        
        return MatchResult(
            hands_played=self.num_hands,
            chips_won=total_chips_won,
            bb_per_100=bb_per_100,
            showdowns=showdowns,
            folds=folds,
            all_ins=all_ins,
            duration_seconds=duration,
            hands_per_second=self.num_hands / duration if duration > 0 else 0,
        )
    
    def get_stats(self) -> Dict[int, AgentStats]:
        """Get agent statistics."""
        return self.stats


class TableMatch:
    """
    Multi-player table match.
    
    Supports 6-max or 9-max games with multiple agents.
    """
    
    def __init__(
        self,
        agents: List[BaseAgent],
        num_hands: int = 1000,
        starting_stack: int = 1000,
        small_blind: int = 5,
        big_blind: int = 10,
        seed: Optional[int] = None
    ):
        if len(agents) < 2:
            raise ValueError("Need at least 2 agents")
        if len(agents) > 9:
            raise ValueError("Maximum 9 agents")
        
        self.agents = agents
        self.num_hands = num_hands
        self.starting_stack = starting_stack
        self.config = GameConfig(
            small_blind=small_blind,
            big_blind=big_blind,
            starting_stack=starting_stack,
            max_players=len(agents)
        )
        self.seed = seed
        
        self.stats: Dict[int, AgentStats] = {
            i: AgentStats() for i in range(len(agents))
        }
    
    def run(self) -> MatchResult:
        """Run the table match."""
        start_time = time.time()
        
        game = PokerGame(self.config, seed=self.seed)
        
        players = [
            PlayerState(player_id=i, stack=self.starting_stack, name=agent.name)
            for i, agent in enumerate(self.agents)
        ]
        
        agent_map = {i: agent for i, agent in enumerate(self.agents)}
        for i, agent in enumerate(self.agents):
            agent.player_id = i
        
        total_chips_won = {i: 0 for i in range(len(self.agents))}
        showdowns = 0
        folds = 0
        
        for _ in range(self.num_hands):
            # Reset stacks
            for p in players:
                p.stack = self.starting_stack
                p.reset_for_new_hand()
            
            try:
                game.new_hand(players)
                result = game.play_hand(agent_map)
                
                for pid, payout in result.payouts.items():
                    net = payout - self.starting_stack
                    total_chips_won[pid] += net
                    self.stats[pid].hands_played += 1
                    self.stats[pid].chips_won += net
                
                if result.went_to_showdown:
                    showdowns += 1
                else:
                    folds += 1
                    
            except Exception:
                continue
        
        duration = time.time() - start_time
        bb = self.config.big_blind
        bb_per_100 = {
            pid: (chips / bb) / (self.num_hands / 100)
            for pid, chips in total_chips_won.items()
        }
        
        return MatchResult(
            hands_played=self.num_hands,
            chips_won=total_chips_won,
            bb_per_100=bb_per_100,
            showdowns=showdowns,
            folds=folds,
            all_ins=0,
            duration_seconds=duration,
            hands_per_second=self.num_hands / duration if duration > 0 else 0,
        )


@dataclass
class BenchmarkResult:
    """Result of a benchmark test."""
    passed: bool
    description: str
    actual_value: float
    threshold: float
    message: str = ""


class AgentBenchmark:
    """
    Benchmark suite for evaluating agent strength.
    
    Standard tests that every agent should pass:
    - Beat RandomAgent by significant margin
    - Beat CallStation
    - Don't go broke vs aggressive players
    """
    
    def __init__(self, agent: BaseAgent, num_hands: int = 1000, seed: Optional[int] = None):
        self.agent = agent
        self.num_hands = num_hands
        self.seed = seed
        self.results: List[BenchmarkResult] = []
    
    def run_all(self) -> List[BenchmarkResult]:
        """Run all benchmark tests."""
        self.results = []
        
        self.results.append(self._test_vs_random())
        self.results.append(self._test_vs_call_station())
        self.results.append(self._test_vs_aggressive())
        self.results.append(self._test_decision_speed())
        
        return self.results
    
    def _test_vs_random(self) -> BenchmarkResult:
        """Test: Should beat RandomAgent by >50bb/100."""
        from .random_agent import RandomAgent
        
        opponent = RandomAgent(seed=self.seed)
        match = HeadsUpMatch(self.agent, opponent, num_hands=self.num_hands, seed=self.seed)
        result = match.run()
        
        bb_100 = result.bb_per_100.get(0, 0)
        threshold = 50
        
        return BenchmarkResult(
            passed=bb_100 > threshold,
            description="Beat RandomAgent by >50bb/100",
            actual_value=bb_100,
            threshold=threshold,
            message=f"Achieved {bb_100:.1f}bb/100 vs RandomAgent"
        )
    
    def _test_vs_call_station(self) -> BenchmarkResult:
        """Test: Should beat CallStation by >30bb/100."""
        from .call_station import CallStationAgent
        
        opponent = CallStationAgent()
        match = HeadsUpMatch(self.agent, opponent, num_hands=self.num_hands, seed=self.seed)
        result = match.run()
        
        bb_100 = result.bb_per_100.get(0, 0)
        threshold = 30
        
        return BenchmarkResult(
            passed=bb_100 > threshold,
            description="Beat CallStation by >30bb/100",
            actual_value=bb_100,
            threshold=threshold,
            message=f"Achieved {bb_100:.1f}bb/100 vs CallStation"
        )
    
    def _test_vs_aggressive(self) -> BenchmarkResult:
        """Test: Should not lose more than -100bb/100 vs aggressive."""
        from .aggressive_agent import AggressiveAgent
        
        opponent = AggressiveAgent(seed=self.seed)
        match = HeadsUpMatch(self.agent, opponent, num_hands=self.num_hands, seed=self.seed)
        result = match.run()
        
        bb_100 = result.bb_per_100.get(0, 0)
        threshold = -100
        
        return BenchmarkResult(
            passed=bb_100 > threshold,
            description="Don't lose more than -100bb/100 vs AggressiveAgent",
            actual_value=bb_100,
            threshold=threshold,
            message=f"Achieved {bb_100:.1f}bb/100 vs AggressiveAgent"
        )
    
    def _test_decision_speed(self) -> BenchmarkResult:
        """Test: Should make decisions quickly (>100 hands/sec)."""
        from .random_agent import RandomAgent
        
        opponent = RandomAgent(seed=self.seed)
        match = HeadsUpMatch(self.agent, opponent, num_hands=500, seed=self.seed)
        result = match.run()
        
        hps = result.hands_per_second
        threshold = 100
        
        return BenchmarkResult(
            passed=hps > threshold,
            description="Process >100 hands/second",
            actual_value=hps,
            threshold=threshold,
            message=f"Achieved {hps:.1f} hands/second"
        )
    
    def print_results(self) -> None:
        """Print benchmark results."""
        print(f"\n{'='*60}")
        print(f"Benchmark Results for {self.agent.name}")
        print(f"{'='*60}")
        
        passed = 0
        for r in self.results:
            status = "✅ PASS" if r.passed else "❌ FAIL"
            print(f"{status}: {r.description}")
            print(f"       {r.message}")
            if r.passed:
                passed += 1
        
        print(f"\n{passed}/{len(self.results)} tests passed")
        print(f"{'='*60}\n")


def run_tournament(
    agents: List[BaseAgent],
    rounds: int = 10,
    hands_per_round: int = 100,
    seed: Optional[int] = None
) -> Dict[str, Any]:
    """
    Run a round-robin tournament between agents.
    
    Each agent plays heads-up against every other agent.
    
    Returns:
        Tournament results with rankings.
    """
    rng = random.Random(seed)
    results = defaultdict(lambda: {'wins': 0, 'losses': 0, 'chips': 0, 'bb_100': []})
    
    # Round robin matchups
    for i, agent1 in enumerate(agents):
        for j, agent2 in enumerate(agents):
            if i >= j:
                continue
            
            for _ in range(rounds):
                match = HeadsUpMatch(
                    agent1, agent2,
                    num_hands=hands_per_round,
                    seed=rng.randint(0, 1000000)
                )
                result = match.run()
                
                # Update stats
                if result.chips_won.get(0, 0) > result.chips_won.get(1, 0):
                    results[agent1.name]['wins'] += 1
                    results[agent2.name]['losses'] += 1
                else:
                    results[agent2.name]['wins'] += 1
                    results[agent1.name]['losses'] += 1
                
                results[agent1.name]['chips'] += result.chips_won.get(0, 0)
                results[agent2.name]['chips'] += result.chips_won.get(1, 0)
                results[agent1.name]['bb_100'].append(result.bb_per_100.get(0, 0))
                results[agent2.name]['bb_100'].append(result.bb_per_100.get(1, 0))
    
    # Calculate rankings
    rankings = []
    for name, stats in results.items():
        avg_bb = statistics.mean(stats['bb_100']) if stats['bb_100'] else 0
        rankings.append({
            'name': name,
            'wins': stats['wins'],
            'losses': stats['losses'],
            'total_chips': stats['chips'],
            'avg_bb_100': avg_bb,
        })
    
    rankings.sort(key=lambda x: x['avg_bb_100'], reverse=True)
    
    return {
        'rankings': rankings,
        'detailed': dict(results),
    }
