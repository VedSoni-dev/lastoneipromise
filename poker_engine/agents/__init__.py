"""
Poker AI Agents Package

This package contains various AI agents for playing poker,
from simple random/rule-based to advanced ML-based agents.
"""

from .base_agent import BaseAgent, AgentContext
from .random_agent import RandomAgent, WeightedRandomAgent
from .call_station import CallStationAgent, NeverFoldAgent
from .aggressive_agent import AggressiveAgent, ManiacAgent
from .rule_based import TAGBot, LAGBot, NITBot
from .registry import AgentRegistry, create_agent, register_agent, list_agents
from .equity import (
    HandRange, calculate_preflop_equity, calculate_equity_vs_range,
    analyze_draws, calculate_pot_odds, calculate_ev, should_call_draw,
    DrawInfo, RANGES
)
from .testing import (
    HeadsUpMatch, TableMatch, AgentBenchmark, MatchResult, AgentStats,
    run_tournament
)

__all__ = [
    # Base
    "BaseAgent", "AgentContext",
    # Basic agents
    "RandomAgent", "WeightedRandomAgent",
    "CallStationAgent", "NeverFoldAgent",
    "AggressiveAgent", "ManiacAgent",
    # Rule-based
    "TAGBot", "LAGBot", "NITBot",
    # Registry
    "AgentRegistry", "create_agent", "register_agent", "list_agents",
    # Equity
    "HandRange", "calculate_preflop_equity", "calculate_equity_vs_range",
    "analyze_draws", "calculate_pot_odds", "calculate_ev", "should_call_draw",
    "DrawInfo", "RANGES",
    # Testing
    "HeadsUpMatch", "TableMatch", "AgentBenchmark", "MatchResult", "AgentStats",
    "run_tournament",
]
