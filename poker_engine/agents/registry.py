"""
Agent Registry

System for registering and instantiating agents by name.
Allows dynamic agent creation for tournaments and testing.
"""

from typing import Dict, Type, Optional, Any, Callable
from .base_agent import BaseAgent


class AgentRegistry:
    """
    Registry for poker agents.
    
    Allows registering agent classes by name and instantiating them
    with configuration.
    
    Example:
        registry = AgentRegistry()
        registry.register("random", RandomAgent)
        agent = registry.create("random", name="Bot1", seed=42)
    """
    
    _instance: Optional['AgentRegistry'] = None
    
    def __new__(cls):
        """Singleton pattern."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._agents = {}
        return cls._instance
    
    def __init__(self):
        self._agents: Dict[str, Type[BaseAgent]] = {}
    
    def register(self, name: str, agent_class: Type[BaseAgent]) -> None:
        """
        Register an agent class.
        
        Args:
            name: Unique name for this agent type.
            agent_class: The agent class (not instance).
        """
        self._agents[name.lower()] = agent_class
    
    def create(self, name: str, **kwargs) -> BaseAgent:
        """
        Create an agent instance.
        
        Args:
            name: Registered agent name.
            **kwargs: Arguments to pass to agent constructor.
            
        Returns:
            New agent instance.
            
        Raises:
            ValueError: If agent name not registered.
        """
        name_lower = name.lower()
        if name_lower not in self._agents:
            raise ValueError(f"Unknown agent: {name}. Available: {list(self._agents.keys())}")
        
        return self._agents[name_lower](**kwargs)
    
    def list_agents(self) -> list:
        """Get list of registered agent names."""
        return list(self._agents.keys())
    
    def is_registered(self, name: str) -> bool:
        """Check if an agent name is registered."""
        return name.lower() in self._agents


# Global registry instance
_global_registry = AgentRegistry()


def register_agent(name: str, agent_class: Type[BaseAgent]) -> None:
    """Register an agent in the global registry."""
    _global_registry.register(name, agent_class)


def create_agent(name: str, **kwargs) -> BaseAgent:
    """Create an agent from the global registry."""
    return _global_registry.create(name, **kwargs)


def list_agents() -> list:
    """List all registered agents."""
    return _global_registry.list_agents()


# Register built-in agents
def _register_builtins():
    """Register all built-in agent types."""
    from .random_agent import RandomAgent, WeightedRandomAgent
    from .call_station import CallStationAgent, NeverFoldAgent
    from .aggressive_agent import AggressiveAgent, ManiacAgent
    from .rule_based import TAGBot, LAGBot, NITBot
    
    register_agent("random", RandomAgent)
    register_agent("weighted_random", WeightedRandomAgent)
    register_agent("call_station", CallStationAgent)
    register_agent("never_fold", NeverFoldAgent)
    register_agent("aggressive", AggressiveAgent)
    register_agent("maniac", ManiacAgent)
    register_agent("tag", TAGBot)
    register_agent("lag", LAGBot)
    register_agent("nit", NITBot)


# Auto-register on import
_register_builtins()
