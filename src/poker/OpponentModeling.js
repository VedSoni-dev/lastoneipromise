/**
 * OpponentModeling - Real-time opponent profiling and exploitation
 * 
 * Features:
 * - Bayesian inference for hand range estimation
 * - Pattern recognition for play style classification
 * - Exploitation strategy generation
 * - Real-time adaptation to opponent adjustments
 * - Hidden Markov Models for action prediction
 */

import * as tf from '@tensorflow/tfjs';

class OpponentModeling {
  constructor() {
    // Opponent profiles for each player
    this.opponentProfiles = new Map();
    
    // Pattern recognition network
    this.patternNetwork = this.buildPatternRecognitionNetwork();
    
    // Hand range estimation network
    this.rangeNetwork = this.buildRangeEstimationNetwork();
    
    // Exploitation strategy network
    this.exploitNetwork = this.buildExploitationNetwork();
    
    // Hidden Markov Model for action sequences
    this.hmm = new HiddenMarkovModel();
    
    // Bayesian belief tracker
    this.beliefTracker = new BayesianBeliefTracker();
    
    // Configuration
    this.config = {
      updateFrequency: 5,  // Update profile every N hands
      minSampleSize: 20,   // Minimum hands before profiling
      decayFactor: 0.95,   // Weight decay for old observations
      exploitThreshold: 0.7, // Confidence threshold for exploitation
      adaptationRate: 0.1   // How quickly to adapt to changes
    };
  }

  buildPatternRecognitionNetwork() {
    const model = tf.sequential({
      name: 'pattern_recognition'
    });

    // Input: sequence of recent actions [sequence_length, action_features]
    model.add(tf.layers.lstm({
      inputShape: [20, 15],  // Last 20 actions, 15 features each
      units: 128,
      returnSequences: true,
      dropout: 0.2
    }));

    model.add(tf.layers.lstm({
      units: 64,
      dropout: 0.2
    }));

    // Attention layer for important patterns
    model.add(tf.layers.dense({ units: 64, activation: 'tanh' }));
    model.add(tf.layers.dense({ units: 64, activation: 'softmax' }));
    
    // Output: player type classification [tight, loose, aggressive, passive, balanced]
    model.add(tf.layers.dense({ units: 5, activation: 'softmax' }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  buildRangeEstimationNetwork() {
    // Network to estimate opponent's hand range
    const model = tf.sequential({
      name: 'range_estimation'
    });

    model.add(tf.layers.dense({
      inputShape: [256],  // Game state + action history
      units: 512,
      activation: 'relu'
    }));

    model.add(tf.layers.dropout({ rate: 0.3 }));
    model.add(tf.layers.batchNormalization());

    // Convolutional layers for pattern detection
    model.add(tf.layers.reshape({ targetShape: [16, 32, 1] }));
    model.add(tf.layers.conv2d({
      filters: 32,
      kernelSize: [3, 5],
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }));
    model.add(tf.layers.conv2d({
      filters: 64,
      kernelSize: [3, 3],
      activation: 'relu'
    }));
    model.add(tf.layers.globalAveragePooling2d());

    // Output: probability distribution over hand strengths
    model.add(tf.layers.dense({ units: 169, activation: 'softmax' })); // All possible starting hands

    model.compile({
      optimizer: tf.train.adam(0.0005),
      loss: 'categoricalCrossentropy'
    });

    return model;
  }

  buildExploitationNetwork() {
    // Network to generate exploitation strategies
    const stateInput = tf.input({ shape: [512], name: 'game_state' });
    const profileInput = tf.input({ shape: [128], name: 'opponent_profile' });
    const rangeInput = tf.input({ shape: [169], name: 'hand_range' });

    // Process game state
    let stateFeatures = tf.layers.dense({ units: 256, activation: 'relu' }).apply(stateInput);
    stateFeatures = tf.layers.dropout({ rate: 0.2 }).apply(stateFeatures);

    // Process opponent profile
    let profileFeatures = tf.layers.dense({ units: 128, activation: 'relu' }).apply(profileInput);
    
    // Process hand range
    let rangeFeatures = tf.layers.dense({ units: 64, activation: 'relu' }).apply(rangeInput);

    // Combine all features
    const combined = tf.layers.concatenate().apply([stateFeatures, profileFeatures, rangeFeatures]);
    
    // Deep processing
    let output = tf.layers.dense({ units: 256, activation: 'relu' }).apply(combined);
    output = tf.layers.batchNormalization().apply(output);
    output = tf.layers.dense({ units: 128, activation: 'relu' }).apply(output);
    output = tf.layers.dropout({ rate: 0.25 }).apply(output);
    
    // Output: exploitation action distribution + sizing
    const actionOutput = tf.layers.dense({ 
      units: 4, 
      activation: 'softmax',
      name: 'exploit_action'
    }).apply(output);

    const sizingOutput = tf.layers.dense({
      units: 1,
      activation: 'sigmoid',
      name: 'bet_sizing'
    }).apply(output);

    const model = tf.model({
      inputs: [stateInput, profileInput, rangeInput],
      outputs: [actionOutput, sizingOutput],
      name: 'exploitation_strategy'
    });

    model.compile({
      optimizer: tf.train.adam(0.0003),
      loss: ['categoricalCrossentropy', 'meanSquaredError'],
      lossWeights: [1.0, 0.5]
    });

    return model;
  }

  async updateOpponentProfile(playerId, action, gameState) {
    if (!this.opponentProfiles.has(playerId)) {
      this.opponentProfiles.set(playerId, new OpponentProfile(playerId));
    }

    const profile = this.opponentProfiles.get(playerId);
    
    // Update action history
    profile.addAction(action, gameState);
    
    // Update statistics
    this.updateStatistics(profile, action, gameState);
    
    // Update pattern recognition if enough data
    if (profile.actionHistory.length >= this.config.minSampleSize) {
      await this.updatePatternRecognition(profile);
      await this.updateHandRange(profile, gameState);
      
      // Update HMM for action prediction
      this.hmm.update(profile.actionHistory);
      
      // Update Bayesian beliefs
      this.beliefTracker.update(profile, action, gameState);
    }
    
    // Check if exploitation is viable
    if (profile.confidence > this.config.exploitThreshold) {
      profile.exploitationStrategy = await this.generateExploitationStrategy(profile, gameState);
    }
    
    return profile;
  }

  updateStatistics(profile, action, gameState) {
    const stats = profile.statistics;
    
    // Update VPIP (Voluntarily Put In Pot)
    if (gameState.stage === 'pre-flop' && (action.type === 'call' || action.type === 'raise')) {
      stats.vpip = this.updateRunningAverage(stats.vpip, 1, stats.handsPlayed);
    } else if (gameState.stage === 'pre-flop' && action.type === 'fold') {
      stats.vpip = this.updateRunningAverage(stats.vpip, 0, stats.handsPlayed);
    }
    
    // Update PFR (Pre-Flop Raise)
    if (gameState.stage === 'pre-flop' && action.type === 'raise') {
      stats.pfr = this.updateRunningAverage(stats.pfr, 1, stats.handsPlayed);
    }
    
    // Update aggression factor
    if (action.type === 'raise') {
      stats.aggressionFactor += 0.1;
    } else if (action.type === 'call') {
      stats.aggressionFactor -= 0.05;
    }
    stats.aggressionFactor = Math.max(0, Math.min(1, stats.aggressionFactor));
    
    // Update 3-bet frequency
    if (gameState.isThreeBet && action.type === 'raise') {
      stats.threeBetFreq = this.updateRunningAverage(stats.threeBetFreq, 1, stats.threeBetOpportunities);
      stats.threeBetOpportunities++;
    }
    
    // Update continuation bet frequency
    if (gameState.wasPreflopAggressor && gameState.stage === 'flop') {
      if (action.type === 'raise' || (action.type === 'call' && gameState.currentBet === 0)) {
        stats.cBetFreq = this.updateRunningAverage(stats.cBetFreq, 1, stats.cBetOpportunities);
      }
      stats.cBetOpportunities++;
    }
    
    // Update fold to pressure
    if (gameState.facingRaise && action.type === 'fold') {
      stats.foldToPressure = this.updateRunningAverage(stats.foldToPressure, 1, stats.pressureSituations);
    }
    stats.pressureSituations++;
    
    // Position-based statistics
    const position = gameState.position;
    if (!stats.positionStats[position]) {
      stats.positionStats[position] = { aggressive: 0, passive: 0, total: 0 };
    }
    
    if (action.type === 'raise') {
      stats.positionStats[position].aggressive++;
    } else {
      stats.positionStats[position].passive++;
    }
    stats.positionStats[position].total++;
    
    stats.handsPlayed++;
    profile.lastUpdate = Date.now();
  }

  async updatePatternRecognition(profile) {
    // Prepare action sequence for pattern recognition
    const actionSequence = this.prepareActionSequence(profile.actionHistory);
    const sequenceTensor = tf.tensor3d([actionSequence]);
    
    // Get pattern classification
    const patterns = await this.patternNetwork.predict(sequenceTensor);
    const patternArray = await patterns.array();
    
    // Update profile with detected patterns
    const patternTypes = ['tight', 'loose', 'aggressive', 'passive', 'balanced'];
    const maxIndex = patternArray[0].indexOf(Math.max(...patternArray[0]));
    
    profile.playStyle = patternTypes[maxIndex];
    profile.styleConfidence = patternArray[0][maxIndex];
    
    // Detect specific patterns
    profile.patterns = this.detectSpecificPatterns(profile.actionHistory);
    
    // Clean up
    sequenceTensor.dispose();
    patterns.dispose();
  }

  async updateHandRange(profile, gameState) {
    // Prepare input for range estimation
    const rangeInput = this.prepareRangeInput(profile, gameState);
    const inputTensor = tf.tensor2d([rangeInput]);
    
    // Estimate hand range
    const rangeEstimate = await this.rangeNetwork.predict(inputTensor);
    const rangeArray = await rangeEstimate.array();
    
    // Update profile with range estimation
    profile.estimatedRange = this.parseHandRange(rangeArray[0]);
    profile.rangeConfidence = this.calculateRangeConfidence(rangeArray[0]);
    
    // Clean up
    inputTensor.dispose();
    rangeEstimate.dispose();
  }

  async generateExploitationStrategy(profile, gameState) {
    // Prepare inputs
    const stateVector = this.encodeGameState(gameState);
    const profileVector = this.encodeProfile(profile);
    const rangeVector = profile.estimatedRange || new Array(169).fill(1/169);
    
    const stateTensor = tf.tensor2d([stateVector]);
    const profileTensor = tf.tensor2d([profileVector]);
    const rangeTensor = tf.tensor2d([rangeVector]);
    
    // Generate exploitation strategy
    const [actionDist, betSizing] = await this.exploitNetwork.predict([
      stateTensor, profileTensor, rangeTensor
    ]);
    
    const actionArray = await actionDist.array();
    const sizingArray = await betSizing.array();
    
    // Parse strategy
    const strategy = {
      actions: {
        fold: actionArray[0][0],
        call: actionArray[0][1],
        raise: actionArray[0][2],
        bluff: actionArray[0][3]
      },
      betSizing: sizingArray[0][0],
      confidence: profile.confidence,
      reasoning: this.generateExploitReasoning(profile)
    };
    
    // Clean up
    stateTensor.dispose();
    profileTensor.dispose();
    rangeTensor.dispose();
    actionDist.dispose();
    betSizing.dispose();
    
    return strategy;
  }

  detectSpecificPatterns(actionHistory) {
    const patterns = {
      donkBetting: false,
      checkRaising: false,
      floatBetting: false,
      slowPlaying: false,
      overBetting: false,
      minBetting: false,
      timingTells: [],
      bettingPatterns: []
    };
    
    // Analyze recent actions for patterns
    const recentActions = actionHistory.slice(-50);
    
    // Detect donk betting
    patterns.donkBetting = this.detectDonkBetting(recentActions);
    
    // Detect check-raising
    patterns.checkRaising = this.detectCheckRaising(recentActions);
    
    // Detect slow playing
    patterns.slowPlaying = this.detectSlowPlaying(recentActions);
    
    // Detect bet sizing patterns
    patterns.bettingPatterns = this.analyzeBetSizing(recentActions);
    
    // Detect timing tells
    patterns.timingTells = this.analyzeTimingPatterns(recentActions);
    
    return patterns;
  }

  prepareActionSequence(actionHistory) {
    const sequence = [];
    const maxLength = 20;
    const recentActions = actionHistory.slice(-maxLength);
    
    for (let i = 0; i < maxLength; i++) {
      if (i < recentActions.length) {
        const action = recentActions[i];
        sequence.push(this.encodeAction(action));
      } else {
        sequence.push(new Array(15).fill(0)); // Padding
      }
    }
    
    return sequence;
  }

  encodeAction(action) {
    const encoded = new Array(15).fill(0);
    
    // Action type (one-hot)
    const actionTypes = ['fold', 'call', 'raise', 'check'];
    const actionIndex = actionTypes.indexOf(action.type);
    if (actionIndex >= 0) encoded[actionIndex] = 1;
    
    // Bet size (normalized)
    encoded[4] = action.betSize ? Math.min(action.betSize / action.pot, 2) / 2 : 0;
    
    // Position
    encoded[5] = action.position / 4;
    
    // Stage
    const stages = ['pre-flop', 'flop', 'turn', 'river'];
    const stageIndex = stages.indexOf(action.stage);
    if (stageIndex >= 0) encoded[6 + stageIndex] = 1;
    
    // Pot odds
    encoded[10] = action.potOdds || 0;
    
    // Stack depth
    encoded[11] = Math.min(action.stackDepth / 100, 1);
    
    // Time taken (normalized)
    encoded[12] = Math.min(action.timeMs / 30000, 1);
    
    // Previous action context
    encoded[13] = action.wasRaised ? 1 : 0;
    encoded[14] = action.isThreeBet ? 1 : 0;
    
    return encoded;
  }

  generateExploitReasoning(profile) {
    const reasons = [];
    
    if (profile.statistics.vpip > 0.3) {
      reasons.push('Playing too many hands - can value bet thinner');
    }
    
    if (profile.statistics.foldToPressure > 0.7) {
      reasons.push('Folds to pressure - increase bluff frequency');
    }
    
    if (profile.patterns.slowPlaying) {
      reasons.push('Tends to slow play - be cautious of check-raises');
    }
    
    if (profile.statistics.aggressionFactor > 0.7) {
      reasons.push('Very aggressive - can trap with strong hands');
    }
    
    return reasons;
  }

  predictNextAction(playerId, gameState) {
    const profile = this.opponentProfiles.get(playerId);
    if (!profile || profile.actionHistory.length < this.config.minSampleSize) {
      return null;
    }
    
    // Use HMM for action prediction
    const hmmPrediction = this.hmm.predict(profile.actionHistory);
    
    // Use Bayesian beliefs
    const bayesianPrediction = this.beliefTracker.predict(profile, gameState);
    
    // Combine predictions
    const combinedPrediction = {
      action: this.combinePredictions(hmmPrediction, bayesianPrediction),
      confidence: (hmmPrediction.confidence + bayesianPrediction.confidence) / 2,
      reasoning: {
        hmm: hmmPrediction,
        bayesian: bayesianPrediction
      }
    };
    
    return combinedPrediction;
  }

  updateRunningAverage(current, newValue, count) {
    return (current * count + newValue) / (count + 1);
  }

  // Helper methods that need implementation
  prepareRangeInput(profile, gameState) {
    // Convert profile and game state to feature vector for range estimation
    return new Array(256).fill(0);
  }

  parseHandRange(rangeArray) {
    // Parse neural network output into hand range format
    return rangeArray;
  }

  calculateRangeConfidence(rangeArray) {
    // Calculate confidence in range estimation
    const entropy = -rangeArray.reduce((sum, prob) => sum + (prob * Math.log(prob + 1e-10)), 0);
    return 1 - (entropy / Math.log(169));
  }

  encodeGameState(gameState) {
    // Encode game state to feature vector
    return new Array(512).fill(0);
  }

  encodeProfile(profile) {
    // Encode opponent profile to feature vector
    return new Array(128).fill(0);
  }

  detectDonkBetting(actions) {
    // Detect donk betting pattern
    return false;
  }

  detectCheckRaising(actions) {
    // Detect check-raising pattern
    return false;
  }

  detectSlowPlaying(actions) {
    // Detect slow playing pattern
    return false;
  }

  analyzeBetSizing(actions) {
    // Analyze bet sizing patterns
    return [];
  }

  analyzeTimingPatterns(actions) {
    // Analyze timing patterns
    return [];
  }

  combinePredictions(hmmPrediction, bayesianPrediction) {
    // Combine HMM and Bayesian predictions
    return hmmPrediction.action || bayesianPrediction.action || 'call';
  }
}

class OpponentProfile {
  constructor(playerId) {
    this.playerId = playerId;
    this.actionHistory = [];
    this.statistics = {
      vpip: 0.25,
      pfr: 0.15,
      aggressionFactor: 0.5,
      threeBetFreq: 0.05,
      cBetFreq: 0.5,
      foldToPressure: 0.5,
      handsPlayed: 0,
      threeBetOpportunities: 0,
      cBetOpportunities: 0,
      pressureSituations: 0,
      positionStats: {}
    };
    this.playStyle = 'unknown';
    this.styleConfidence = 0;
    this.patterns = {};
    this.estimatedRange = null;
    this.rangeConfidence = 0;
    this.exploitationStrategy = null;
    this.confidence = 0;
    this.lastUpdate = Date.now();
  }

  addAction(action, gameState) {
    this.actionHistory.push({
      ...action,
      timestamp: Date.now(),
      gameState: this.compressGameState(gameState)
    });
    
    // Keep history size manageable
    if (this.actionHistory.length > 1000) {
      this.actionHistory = this.actionHistory.slice(-500);
    }
  }

  compressGameState(gameState) {
    // Store only essential information
    return {
      stage: gameState.stage,
      pot: gameState.pot,
      position: gameState.position,
      stackDepth: gameState.stackDepth,
      communityCards: gameState.communityCards?.length || 0
    };
  }
}

class HiddenMarkovModel {
  constructor() {
    this.states = ['tight-passive', 'tight-aggressive', 'loose-passive', 'loose-aggressive'];
    this.observations = ['fold', 'call', 'raise'];
    this.transitionMatrix = this.initializeTransitionMatrix();
    this.emissionMatrix = this.initializeEmissionMatrix();
    this.currentState = null;
  }

  initializeTransitionMatrix() {
    // Initialize with slight preference for staying in same state
    return [
      [0.6, 0.2, 0.1, 0.1],
      [0.2, 0.6, 0.1, 0.1],
      [0.1, 0.1, 0.6, 0.2],
      [0.1, 0.1, 0.2, 0.6]
    ];
  }

  initializeEmissionMatrix() {
    // Probability of each action given state
    return [
      [0.7, 0.25, 0.05],  // tight-passive: mostly folds
      [0.4, 0.2, 0.4],    // tight-aggressive: selective but aggressive
      [0.3, 0.5, 0.2],    // loose-passive: calls a lot
      [0.2, 0.3, 0.5]     // loose-aggressive: raises frequently
    ];
  }

  update(actionHistory) {
    // Baum-Welch algorithm for updating HMM parameters
    // Simplified version for real-time updates
    if (actionHistory.length < 10) return;
    
    const observations = actionHistory.slice(-20).map(a => 
      this.observations.indexOf(a.type)
    );
    
    // Update emission probabilities based on observed frequencies
    for (let state = 0; state < this.states.length; state++) {
      const counts = [0, 0, 0];
      observations.forEach(obs => {
        if (obs >= 0) counts[obs]++;
      });
      
      const total = counts.reduce((a, b) => a + b, 0);
      if (total > 0) {
        for (let obs = 0; obs < 3; obs++) {
          this.emissionMatrix[state][obs] = 
            0.7 * this.emissionMatrix[state][obs] + 0.3 * (counts[obs] / total);
        }
      }
    }
  }

  predict(actionHistory) {
    if (actionHistory.length < 5) {
      return { action: 'call', confidence: 0.3 };
    }
    
    // Viterbi algorithm for most likely current state
    const observations = actionHistory.slice(-10).map(a => 
      this.observations.indexOf(a.type)
    ).filter(o => o >= 0);
    
    if (observations.length === 0) {
      return { action: 'call', confidence: 0.3 };
    }
    
    // Forward algorithm to compute state probabilities
    const stateProbs = this.forwardAlgorithm(observations);
    const mostLikelyState = stateProbs.indexOf(Math.max(...stateProbs));
    
    // Predict next action based on emission probabilities
    const actionProbs = this.emissionMatrix[mostLikelyState];
    const maxProbIndex = actionProbs.indexOf(Math.max(...actionProbs));
    
    return {
      action: this.observations[maxProbIndex],
      confidence: Math.max(...stateProbs) * actionProbs[maxProbIndex],
      state: this.states[mostLikelyState],
      actionProbabilities: {
        fold: actionProbs[0],
        call: actionProbs[1],
        raise: actionProbs[2]
      }
    };
  }
  
  forwardAlgorithm(observations) {
    const numStates = this.states.length;
    const T = observations.length;
    
    // Initialize forward probabilities
    const alpha = Array(T).fill(null).map(() => Array(numStates).fill(0));
    
    // Initial probabilities (uniform)
    for (let s = 0; s < numStates; s++) {
      alpha[0][s] = (1 / numStates) * this.emissionMatrix[s][observations[0]];
    }
    
    // Forward pass
    for (let t = 1; t < T; t++) {
      for (let s = 0; s < numStates; s++) {
        let sum = 0;
        for (let sPrev = 0; sPrev < numStates; sPrev++) {
          sum += alpha[t-1][sPrev] * this.transitionMatrix[sPrev][s];
        }
        alpha[t][s] = sum * this.emissionMatrix[s][observations[t]];
      }
    }
    
    // Return final state probabilities
    return alpha[T-1];
  }
}

class BayesianBeliefTracker {
  constructor() {
    this.beliefs = new Map();
    this.priors = {
      handStrength: this.initializeHandStrengthPrior(),
      playStyle: this.initializePlayStylePrior()
    };
  }
  
  initializeHandStrengthPrior() {
    // Prior probabilities for hand strength categories
    return {
      premium: 0.05,      // AA, KK, QQ, AK
      strong: 0.10,        // JJ-99, AQ, AJ
      medium: 0.20,        // 88-66, AT, KQ
      weak: 0.30,          // 55-22, suited connectors
      trash: 0.35          // Everything else
    };
  }
  
  initializePlayStylePrior() {
    // Prior probabilities for play styles
    return {
      'tight-aggressive': 0.20,
      'loose-aggressive': 0.20,
      'tight-passive': 0.30,
      'loose-passive': 0.30
    };
  }
  
  update(profile, action, gameState) {
    const playerId = profile.playerId;
    
    if (!this.beliefs.has(playerId)) {
      this.beliefs.set(playerId, {
        handStrength: { ...this.priors.handStrength },
        playStyle: { ...this.priors.playStyle },
        history: []
      });
    }
    
    const belief = this.beliefs.get(playerId);
    
    // Update hand strength belief based on action
    this.updateHandStrengthBelief(belief, action, gameState);
    
    // Update play style belief
    this.updatePlayStyleBelief(belief, profile.statistics);
    
    // Store update in history
    belief.history.push({
      action,
      gameState: this.compressGameState(gameState),
      timestamp: Date.now()
    });
    
    // Limit history size
    if (belief.history.length > 100) {
      belief.history = belief.history.slice(-50);
    }
  }
  
  updateHandStrengthBelief(belief, action, gameState) {
    // Bayesian update based on action
    const likelihood = this.calculateActionLikelihood(action, gameState);
    
    // Update each hand strength category
    let totalProbability = 0;
    const updatedBeliefs = {};
    
    for (const [category, prior] of Object.entries(belief.handStrength)) {
      const categoryLikelihood = likelihood[category] || 0.1;
      updatedBeliefs[category] = prior * categoryLikelihood;
      totalProbability += updatedBeliefs[category];
    }
    
    // Normalize
    for (const category of Object.keys(updatedBeliefs)) {
      belief.handStrength[category] = updatedBeliefs[category] / totalProbability;
    }
  }
  
  calculateActionLikelihood(action, gameState) {
    // Likelihood of action given hand strength
    const likelihoods = {
      premium: { fold: 0.01, call: 0.19, raise: 0.80 },
      strong: { fold: 0.05, call: 0.35, raise: 0.60 },
      medium: { fold: 0.20, call: 0.50, raise: 0.30 },
      weak: { fold: 0.40, call: 0.45, raise: 0.15 },
      trash: { fold: 0.70, call: 0.25, raise: 0.05 }
    };
    
    // Adjust based on game state
    const stageMod = this.getStageModifier(gameState.stage);
    const positionMod = this.getPositionModifier(gameState.position);
    const potOddsMod = this.getPotOddsModifier(gameState);
    
    const result = {};
    for (const [category, actions] of Object.entries(likelihoods)) {
      const baseLikelihood = actions[action.type] || 0.1;
      result[category] = baseLikelihood * stageMod * positionMod * potOddsMod;
    }
    
    return result;
  }
  
  getStageModifier(stage) {
    const modifiers = {
      'pre-flop': 1.0,
      'flop': 0.9,
      'turn': 0.8,
      'river': 0.7
    };
    return modifiers[stage] || 1.0;
  }
  
  getPositionModifier(position) {
    // Later positions allow wider ranges
    return 0.8 + (position / 5) * 0.4;
  }
  
  getPotOddsModifier(gameState) {
    if (!gameState.pot || !gameState.toCall) return 1.0;
    
    const potOdds = gameState.toCall / (gameState.pot + gameState.toCall);
    
    // Better pot odds encourage calling/raising with weaker hands
    if (potOdds < 0.2) return 1.2;  // Great odds
    if (potOdds < 0.33) return 1.1; // Good odds
    if (potOdds > 0.5) return 0.9;  // Poor odds
    return 1.0;
  }
  
  updatePlayStyleBelief(belief, statistics) {
    // Update play style based on statistics
    const vpip = statistics.vpip || 0.25;
    const pfr = statistics.pfr || 0.15;
    const aggression = statistics.aggressionFactor || 0.5;
    
    // Calculate style likelihoods
    const likelihoods = {
      'tight-aggressive': (vpip < 0.3) && (aggression > 0.6) ? 0.8 : 0.2,
      'loose-aggressive': (vpip > 0.3) && (aggression > 0.6) ? 0.8 : 0.2,
      'tight-passive': (vpip < 0.3) && (aggression < 0.4) ? 0.8 : 0.2,
      'loose-passive': (vpip > 0.3) && (aggression < 0.4) ? 0.8 : 0.2
    };
    
    // Bayesian update
    let totalProbability = 0;
    const updatedBeliefs = {};
    
    for (const [style, prior] of Object.entries(belief.playStyle)) {
      updatedBeliefs[style] = prior * likelihoods[style];
      totalProbability += updatedBeliefs[style];
    }
    
    // Normalize
    for (const style of Object.keys(updatedBeliefs)) {
      belief.playStyle[style] = updatedBeliefs[style] / totalProbability;
    }
  }
  
  predict(profile, gameState) {
    const playerId = profile.playerId;
    const belief = this.beliefs.get(playerId);
    
    if (!belief) {
      return { action: 'call', confidence: 0.3 };
    }
    
    // Find most likely hand strength
    const handStrengths = Object.entries(belief.handStrength);
    handStrengths.sort((a, b) => b[1] - a[1]);
    const likelyStrength = handStrengths[0][0];
    
    // Find most likely play style
    const playStyles = Object.entries(belief.playStyle);
    playStyles.sort((a, b) => b[1] - a[1]);
    const likelyStyle = playStyles[0][0];
    
    // Predict action based on hand strength and play style
    const prediction = this.predictFromBeliefs(likelyStrength, likelyStyle, gameState);
    
    return {
      action: prediction.action,
      confidence: handStrengths[0][1] * playStyles[0][1],
      beliefs: {
        handStrength: likelyStrength,
        handConfidence: handStrengths[0][1],
        playStyle: likelyStyle,
        styleConfidence: playStyles[0][1]
      }
    };
  }
  
  predictFromBeliefs(handStrength, playStyle, gameState) {
    // Prediction matrix based on hand strength and play style
    const predictions = {
      'tight-aggressive': {
        premium: 'raise',
        strong: 'raise',
        medium: 'call',
        weak: 'fold',
        trash: 'fold'
      },
      'loose-aggressive': {
        premium: 'raise',
        strong: 'raise',
        medium: 'raise',
        weak: 'call',
        trash: 'fold'
      },
      'tight-passive': {
        premium: 'call',
        strong: 'call',
        medium: 'call',
        weak: 'fold',
        trash: 'fold'
      },
      'loose-passive': {
        premium: 'call',
        strong: 'call',
        medium: 'call',
        weak: 'call',
        trash: 'fold'
      }
    };
    
    const baseAction = predictions[playStyle]?.[handStrength] || 'call';
    
    // Adjust based on game state
    let action = baseAction;
    
    // If facing a large bet, be more conservative
    if (gameState.facingLargeBet) {
      if (action === 'call' && handStrength !== 'premium') {
        action = 'fold';
      }
    }
    
    // If pot odds are good, be more aggressive
    if (gameState.goodPotOdds) {
      if (action === 'fold' && handStrength !== 'trash') {
        action = 'call';
      }
    }
    
    return { action };
  }
  
  compressGameState(gameState) {
    return {
      stage: gameState.stage,
      pot: gameState.pot,
      position: gameState.position,
      facingBet: gameState.currentBet > 0,
      stackDepth: gameState.stackDepth
    };
  }
}

// Utility functions for opponent modeling
class OpponentModelingUtils {
  static calculateHandEquity(hand, communityCards, opponentRange) {
    // Monte Carlo simulation for equity calculation
    let wins = 0;
    const simulations = 1000;
    
    for (let i = 0; i < simulations; i++) {
      // Sample opponent hand from range
      const opponentHand = this.sampleFromRange(opponentRange);
      
      // Simulate remaining cards
      const board = this.completeBoard(communityCards);
      
      // Evaluate hands
      const ourStrength = this.evaluateHand([...hand, ...board]);
      const oppStrength = this.evaluateHand([...opponentHand, ...board]);
      
      if (ourStrength > oppStrength) wins++;
    }
    
    return wins / simulations;
  }
  
  static getExploitativeAdjustment(profile) {
    const adjustments = {
      action: {},
      sizing: {}
    };
    
    // Against tight players
    if (profile.statistics.vpip < 0.2) {
      adjustments.action.bluffMore = true;
      adjustments.sizing.smallerValueBets = true;
    }
    
    // Against loose players
    if (profile.statistics.vpip > 0.35) {
      adjustments.action.valueBetThin = true;
      adjustments.sizing.largerValueBets = true;
    }
    
    // Against aggressive players
    if (profile.statistics.aggressionFactor > 0.7) {
      adjustments.action.trapMore = true;
      adjustments.action.callDownLight = true;
    }
    
    // Against passive players
    if (profile.statistics.aggressionFactor < 0.3) {
      adjustments.action.bluffMore = true;
      adjustments.action.betForProtection = true;
    }
    
    return adjustments;
  }

  static sampleFromRange(range) {
    // Sample a hand from the range distribution
    const random = Math.random();
    let cumSum = 0;
    for (let i = 0; i < range.length; i++) {
      cumSum += range[i];
      if (random < cumSum) {
        return this.indexToHand(i);
      }
    }
    return this.indexToHand(0);
  }

  static completeBoard(communityCards) {
    // Complete the board with random cards
    return communityCards; // Simplified
  }

  static evaluateHand(cards) {
    // Evaluate hand strength
    return 0.5; // Simplified
  }

  static indexToHand(index) {
    // Convert index to hand representation
    return []; // Simplified
  }
}

export { OpponentModeling, OpponentProfile, HiddenMarkovModel, BayesianBeliefTracker, OpponentModelingUtils };


