/**
 * PersonalityAwareStateEncoder - Hybrid system combining RL with personality-driven agents
 * 
 * Each agent has:
 * - Unique personality embedding for neural network
 * - Personality traits that affect decision-making
 * - LLM integration for natural chat
 * - Individual neural networks trained with personality biases
 */

class PersonalityAwareStateEncoder {
  constructor() {
    // Game state dimensions (same as before)
    this.CARD_DIM = 52
    this.HAND_DIM = 104
    this.COMMUNITY_DIM = 260
    this.POSITION_DIM = 5
    this.ACTION_HISTORY_DIM = 50
    this.BETTING_ROUND_DIM = 4
    this.STACK_DIM = 5
    this.POT_ODDS_DIM = 10
    this.OPPONENT_STATS_DIM = 80
    
    // NEW: Personality dimensions
    this.PERSONALITY_EMBEDDING_DIM = 32  // Personality vector
    this.EMOTIONAL_STATE_DIM = 16  // Current emotional state (tilted, confident, etc)
    this.CHAT_CONTEXT_DIM = 64  // Encoded recent chat for context
    
    this.TOTAL_DIM = 512 + 32 + 16 + 64  // 624 total
    
    // Personality profiles with embeddings
    this.PERSONALITY_PROFILES = {
      'Alex': {
        embedding: this.createPersonalityEmbedding('aggressive', 0.9, 0.8, 0.3, 0.7),
        traits: {
          aggression: 0.9,
          bluffFrequency: 0.8,
          tiltResistance: 0.3,
          chattiness: 0.8,
          trashTalk: 0.9,
          riskTolerance: 0.85
        },
        chatStyle: 'aggressive and confident',
        emotionalVolatility: 0.7
      },
      'Sam': {
        embedding: this.createPersonalityEmbedding('cautious', 0.2, 0.1, 0.9, 0.3),
        traits: {
          aggression: 0.2,
          bluffFrequency: 0.1,
          tiltResistance: 0.9,
          chattiness: 0.4,
          trashTalk: 0.1,
          riskTolerance: 0.2
        },
        chatStyle: 'analytical and polite',
        emotionalVolatility: 0.2
      },
      'Jordan': {
        embedding: this.createPersonalityEmbedding('chaotic', 0.6, 0.7, 0.4, 0.9),
        traits: {
          aggression: 0.6,
          bluffFrequency: 0.7,
          tiltResistance: 0.4,
          chattiness: 0.9,
          trashTalk: 0.5,
          riskTolerance: 0.95,
          unpredictability: 0.9  // Special trait for Jordan
        },
        chatStyle: 'wild and unpredictable',
        emotionalVolatility: 0.8
      },
      'Casey': {
        embedding: this.createPersonalityEmbedding('balanced', 0.5, 0.4, 0.7, 0.5),
        traits: {
          aggression: 0.5,
          bluffFrequency: 0.4,
          tiltResistance: 0.7,
          chattiness: 0.6,
          trashTalk: 0.3,
          riskTolerance: 0.5,
          adaptability: 0.9  // Special trait for Casey
        },
        chatStyle: 'observant and adaptive',
        emotionalVolatility: 0.4
      }
    }
    
    // Emotional states that affect play
    this.emotionalStates = {
      neutral: [0, 0, 0, 0],
      tilted: [1, 0, 0, 0],
      confident: [0, 1, 0, 0],
      cautious: [0, 0, 1, 0],
      aggressive: [0, 0, 0, 1]
    }
  }

  createPersonalityEmbedding(style, aggression, bluff, discipline, social) {
    // Create a 32-dim personality embedding
    const embedding = new Float32Array(32);
    
    // Core personality dimensions
    embedding[0] = aggression;
    embedding[1] = bluff;
    embedding[2] = discipline;
    embedding[3] = social;
    
    // Style-specific patterns
    switch(style) {
      case 'aggressive':
        for(let i = 4; i < 12; i++) embedding[i] = Math.random() * 0.3 + 0.7;
        break;
      case 'cautious':
        for(let i = 4; i < 12; i++) embedding[i] = Math.random() * 0.3 + 0.1;
        break;
      case 'chaotic':
        for(let i = 4; i < 12; i++) embedding[i] = Math.random();
        break;
      case 'balanced':
        for(let i = 4; i < 12; i++) embedding[i] = Math.random() * 0.3 + 0.35;
        break;
    }
    
    // Random variations for uniqueness
    for(let i = 12; i < 32; i++) {
      embedding[i] = Math.random() * 0.5 + 0.25;
    }
    
    return embedding;
  }

  // Encode state WITH personality for a specific agent
  encodeStateForAgent(gameState, agentName, emotionalState = 'neutral', recentChat = []) {
    const state = new Float32Array(this.TOTAL_DIM);
    let offset = 0;
    
    // 1. Encode base game state (512 dims)
    const baseState = this.encodeBaseGameState(gameState);
    state.set(baseState, offset);
    offset += 512;
    
    // 2. Encode personality (32 dims)
    const personality = this.PERSONALITY_PROFILES[agentName];
    if (!personality) {
      console.warn(`Unknown agent: ${agentName}, using default`);
      return this.encodeStateForAgent(gameState, 'Casey', emotionalState, recentChat);
    }
    state.set(personality.embedding, offset);
    offset += this.PERSONALITY_EMBEDDING_DIM;
    
    // 3. Encode emotional state (16 dims)
    const emotionalVector = this.encodeEmotionalState(emotionalState, personality, gameState);
    state.set(emotionalVector, offset);
    offset += this.EMOTIONAL_STATE_DIM;
    
    // 4. Encode chat context (64 dims)
    const chatContext = this.encodeChatContext(recentChat, agentName);
    state.set(chatContext, offset);
    
    return state;
  }

  encodeBaseGameState(gameState) {
    // Encode the core poker game state
    const state = new Float32Array(512);
    let offset = 0;
    
    // Encode hole cards (104 dims: 2 cards * 52 possible cards)
    if (gameState.hand && gameState.hand.length === 2) {
      gameState.hand.forEach(card => {
        const cardIndex = this.getCardIndex(card);
        if (cardIndex >= 0 && cardIndex < 52) {
          state[offset + cardIndex] = 1.0;
        }
      });
    }
    offset += this.HAND_DIM;
    
    // Encode community cards (260 dims: 5 cards * 52 possible cards)
    if (gameState.communityCards) {
      gameState.communityCards.forEach(card => {
        const cardIndex = this.getCardIndex(card);
        if (cardIndex >= 0 && cardIndex < 52) {
          state[offset + cardIndex] = 1.0;
        }
      });
    }
    offset += this.COMMUNITY_DIM;
    
    // Encode position (5 dims: button, small blind, big blind, etc.)
    if (gameState.position !== undefined) {
      state[offset + gameState.position] = 1.0;
    }
    offset += this.POSITION_DIM;
    
    // Encode betting round (4 dims: pre-flop, flop, turn, river)
    const roundMap = { 'pre-flop': 0, 'flop': 1, 'turn': 2, 'river': 3 };
    if (gameState.bettingStage) {
      const roundIndex = roundMap[gameState.bettingStage] || 0;
      state[offset + roundIndex] = 1.0;
    }
    offset += this.BETTING_ROUND_DIM;
    
    // Encode stack sizes (normalized)
    if (gameState.chips !== undefined) {
      const normalizedChips = Math.min(gameState.chips / 1000, 1.0);
      state[offset] = normalizedChips;
    }
    offset += 1;
    
    if (gameState.opponentChips) {
      gameState.opponentChips.forEach((chips, idx) => {
        if (idx < 4) {
          const normalized = Math.min(chips / 1000, 1.0);
          state[offset + idx] = normalized;
        }
      });
    }
    offset += 4;
    
    // Encode pot odds
    if (gameState.pot && gameState.currentBet) {
      const potOdds = gameState.currentBet / (gameState.pot + gameState.currentBet);
      state[offset] = Math.min(potOdds, 1.0);
    }
    offset += this.POT_ODDS_DIM;
    
    // Encode action history (simplified - last 10 actions)
    if (gameState.actionHistory) {
      gameState.actionHistory.slice(-10).forEach((action, idx) => {
        if (idx < 10) {
          const actionMap = { 'fold': 0, 'call': 1, 'raise': 2 };
          const actionIndex = actionMap[action.type] || 0;
          state[offset + idx * 5 + actionIndex] = 1.0;
        }
      });
    }
    offset += this.ACTION_HISTORY_DIM;
    
    // Encode opponent stats (simplified)
    if (gameState.opponentStats) {
      Object.values(gameState.opponentStats).slice(0, 4).forEach((stats, idx) => {
        if (idx < 4 && stats) {
          state[offset + idx * 20] = stats.aggression || 0;
          state[offset + idx * 20 + 1] = stats.foldRate || 0;
          state[offset + idx * 20 + 2] = stats.raiseRate || 0;
          state[offset + idx * 20 + 3] = stats.vpip || 0; // Voluntarily put in pot
        }
      });
    }
    offset += this.OPPONENT_STATS_DIM;
    
    // Fill remaining space
    while (offset < 512) {
      state[offset] = 0;
      offset++;
    }
    
    return state;
  }

  getCardIndex(card) {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    
    const suitIndex = suits.indexOf(card.suit);
    const valueIndex = values.indexOf(card.value);
    
    if (suitIndex === -1 || valueIndex === -1) return -1;
    
    return suitIndex * 13 + valueIndex;
  }

  encodeEmotionalState(emotionalState, personality, gameState = {}) {
    const vector = new Float32Array(this.EMOTIONAL_STATE_DIM);
    
    // Base emotional state
    const baseEmotion = this.emotionalStates[emotionalState] || this.emotionalStates.neutral;
    vector.set(baseEmotion, 0);
    
    // Personality-influenced emotional modulation
    vector[4] = personality.traits.emotionalVolatility || 0.5;
    vector[5] = personality.traits.tiltResistance || 0.5;
    vector[6] = personality.traits.riskTolerance || 0.5;
    
    // Recent performance impact on emotions
    vector[7] = (gameState.recentWins || 0) / 10; // Normalize
    vector[8] = (gameState.recentLosses || 0) / 10;
    vector[9] = (gameState.biggestPotWon || 0) / 1000; // Normalize
    
    // Fill remaining with personality-based noise
    for(let i = 10; i < 16; i++) {
      vector[i] = Math.random() * (personality.emotionalVolatility || 0.5);
    }
    
    return vector;
  }

  encodeChatContext(recentChat, agentName) {
    const vector = new Float32Array(this.CHAT_CONTEXT_DIM);
    
    // Analyze recent chat for sentiment and game info
    let aggressionDetected = 0;
    let bluffMentions = 0;
    let confidenceLevel = 0;
    let socialEngagement = 0;
    
    if (recentChat && recentChat.length > 0) {
      recentChat.slice(-10).forEach(msg => {
        const text = (msg.text || '').toLowerCase();
        
        // Detect aggression
        if (text.includes('raise') || text.includes('all in') || text.includes('bet')) {
          aggressionDetected += 0.1;
        }
        
        // Detect bluff talk
        if (text.includes('bluff') || text.includes('fake') || text.includes('trick')) {
          bluffMentions += 0.1;
        }
        
        // Detect confidence
        if (text.includes('sure') || text.includes('definitely') || text.includes('got this')) {
          confidenceLevel += 0.1;
        }
        
        // Social engagement
        if (msg.speaker === agentName) {
          socialEngagement += 0.1;
        }
      });
    }
    
    // Encode detected patterns
    vector[0] = Math.min(aggressionDetected, 1);
    vector[1] = Math.min(bluffMentions, 1);
    vector[2] = Math.min(confidenceLevel, 1);
    vector[3] = Math.min(socialEngagement, 1);
    
    // Encode chat frequency and patterns
    // Will be filled by more sophisticated NLP in future nodes
    for(let i = 4; i < 64; i++) {
      vector[i] = 0;
    }
    
    return vector;
  }

  // Generate personality-consistent action probabilities
  applyPersonalityBias(actionProbabilities, agentName, gameContext = {}) {
    const personality = this.PERSONALITY_PROFILES[agentName];
    if (!personality) return actionProbabilities;
    
    const [foldProb, callProb, raiseProb] = actionProbabilities;
    
    // Apply personality biases
    let adjustedProbs = [...actionProbabilities];
    
    // Aggressive personalities boost raise probability
    adjustedProbs[2] *= (1 + personality.traits.aggression * 0.5);
    
    // Cautious personalities boost fold probability  
    adjustedProbs[0] *= (1 + (1 - personality.traits.riskTolerance) * 0.5);
    
    // Unpredictable personalities add noise
    if (personality.traits.unpredictability) {
      const noise = personality.traits.unpredictability * 0.2;
      adjustedProbs = adjustedProbs.map(p => p + (Math.random() - 0.5) * noise);
    }
    
    // Normalize probabilities
    const sum = adjustedProbs.reduce((a, b) => a + b, 0);
    return adjustedProbs.map(p => Math.max(0, p) / sum);
  }

  // Determine if agent should chat based on personality and context
  shouldAgentChat(agentName, gameContext = {}, recentChat = []) {
    const personality = this.PERSONALITY_PROFILES[agentName];
    if (!personality) return false;
    
    // Base chat probability from personality
    let chatProb = personality.traits.chattiness;
    
    // Increase if recently addressed
    const wasAddressed = recentChat && recentChat.slice(-3).some(msg => 
      (msg.text || '').toLowerCase().includes(agentName.toLowerCase())
    );
    if (wasAddressed) chatProb += 0.3;
    
    // Increase if winning/losing big
    if (gameContext.justWonBigPot) chatProb += 0.2;
    if (gameContext.justLostBigPot) chatProb += 0.15;
    
    // Personality-specific triggers
    if (agentName === 'Alex' && gameContext.justBluffed) chatProb += 0.4;
    if (agentName === 'Sam' && gameContext.complexBoard) chatProb += 0.2;
    if (agentName === 'Jordan') chatProb += Math.random() * 0.2; // Random boost
    if (agentName === 'Casey' && gameContext.opponentTells) chatProb += 0.25;
    
    return Math.random() < Math.min(chatProb, 0.8);
  }

  // Get personality profile for an agent
  getPersonalityProfile(agentName) {
    return this.PERSONALITY_PROFILES[agentName] || this.PERSONALITY_PROFILES['Casey'];
  }
}

export default PersonalityAwareStateEncoder;


