"""
Test script for Phase 2 agents.
Run with: python -m poker_engine.test_agents
"""

from poker_engine.agents import (
    create_agent, list_agents, HeadsUpMatch
)


def test_agent_creation():
    """Test creating agents from registry."""
    print("Testing agent creation...")
    agents = list_agents()
    print(f"Available agents: {agents}")
    
    for agent_type in ['random', 'tag', 'call_station', 'aggressive']:
        agent = create_agent(agent_type)
        print(f"  Created: {agent.name}")
    
    print("OK: Agent creation works!\n")


def test_heads_up_match():
    """Test heads-up match between agents."""
    print("Testing HeadsUpMatch...")
    
    tag = create_agent('tag')
    rand = create_agent('random')
    
    match = HeadsUpMatch(tag, rand, num_hands=50, seed=42)
    result = match.run()
    
    print(f"  Match: {tag.name} vs {rand.name}")
    print(f"  Hands played: {result.hands_played}")
    print(f"  TAG bb/100: {result.bb_per_100[0]:.1f}")
    print(f"  Random bb/100: {result.bb_per_100[1]:.1f}")
    print(f"  Hands/sec: {result.hands_per_second:.1f}")
    print(f"  Winner: {'TAG' if result.bb_per_100[0] > 0 else 'Random'}")
    print("OK: HeadsUpMatch works!\n")


def test_different_matchups():
    """Test various agent matchups."""
    print("Testing different matchups (25 hands each)...")
    
    matchups = [
        ('tag', 'random'),
        ('lag', 'nit'),
        ('aggressive', 'call_station'),
    ]
    
    for type1, type2 in matchups:
        a1 = create_agent(type1)
        a2 = create_agent(type2)
        
        match = HeadsUpMatch(a1, a2, num_hands=25, seed=123)
        result = match.run()
        
        winner = a1.name if result.bb_per_100[0] > 0 else a2.name
        print(f"  {a1.name} vs {a2.name}: Winner = {winner}")
    
    print("OK: All matchups completed!\n")


def main():
    print("=" * 60)
    print("PHASE 2 AGENT TESTING")
    print("=" * 60 + "\n")
    
    test_agent_creation()
    test_heads_up_match()
    test_different_matchups()
    
    print("=" * 60)
    print("All Phase 2 tests passed!")
    print("=" * 60)


if __name__ == "__main__":
    main()
