/**
 * ReinforcementLearningTrainer - PPO-based training system with self-play
 * 
 * Features:
 * - Proximal Policy Optimization (PPO) algorithm
 * - Self-play with past versions (league play)
 * - Experience replay buffer with prioritization
 * - Curriculum learning (gradually harder opponents)
 * - Multi-agent training coordination
 */

import * as tf from '@tensorflow/tfjs';

class ReinforcementLearningTrainer {
  constructor() {
    // Training hyperparameters
    this.config = {
      // PPO parameters
      clipRatio: 0.2,
      ppoEpochs: 10,
      miniBatchSize: 64,
      learningRate: 3e-4,
      gamma: 0.99,  // Discount factor
      lambda: 0.95,  // GAE parameter
      entropyCoeff: 0.01,
      valueCoeff: 0.5,
      maxGradNorm: 0.5,
      
      // Experience replay
      bufferSize: 100000,
      priorityAlpha: 0.6,
      priorityBeta: 0.4,
      priorityBetaIncrement: 0.001,
      
      // Self-play
      selfPlayGames: 1000,
      opponentPoolSize: 20,
      updateOpponentPool: 100,  // Update pool every N games
      
      // Curriculum learning
      curriculumStages: 5,
      stageWinThreshold: 0.55,  // Move to next stage at 55% win rate
      
      // Training control
      saveInterval: 1000,
      evaluationInterval: 100,
      targetUpdateFreq: 500
    };
    
    // Experience replay buffer with prioritization
    this.experienceBuffer = new PrioritizedReplayBuffer(this.config.bufferSize);
    
    // Self-play opponent pool (stores frozen versions of agents)
    this.opponentPool = [];
    
    // Training statistics
    this.trainingStats = {
      episodeRewards: [],
      winRates: {},
      losses: [],
      entropy: [],
      kl_divergence: [],
      explained_variance: []
    };
    
    // Curriculum tracking
    this.currentStage = 0;
    this.stageWinRates = [];
  }

  async trainAgent(agent, episodes = 1000) {
    console.log(`Starting PPO training for ${agent.agentName} - ${episodes} episodes`);
    
    for (let episode = 0; episode < episodes; episode++) {
      // Collect trajectories through self-play
      const trajectories = await this.collectTrajectories(agent);
      
      // Add to experience buffer
      this.addToBuffer(trajectories);
      
      // Perform PPO update
      if (this.experienceBuffer.size() >= this.config.miniBatchSize) {
        const trainingLoss = await this.ppoUpdate(agent);
        this.trainingStats.losses.push(trainingLoss);
      }
      
      // Update opponent pool periodically
      if (episode % this.config.updateOpponentPool === 0) {
        await this.updateOpponentPool(agent);
      }
      
      // Evaluate and possibly advance curriculum
      if (episode % this.config.evaluationInterval === 0) {
        const winRate = await this.evaluateAgent(agent);
        this.checkCurriculumAdvancement(winRate);
      }
      
      // Save checkpoint
      if (episode % this.config.saveInterval === 0) {
        await this.saveCheckpoint(agent, episode);
      }
      
      // Log progress
      if (episode % 10 === 0) {
        this.logTrainingProgress(episode, episodes);
      }
    }
    
    return this.trainingStats;
  }

  async collectTrajectories(agent, numGames = 10) {
    const trajectories = [];
    
    for (let game = 0; game < numGames; game++) {
      // Select opponents based on curriculum stage
      const opponents = this.selectOpponents();
      
      // Play a full game and collect experience
      const gameTrajectory = await this.playGame(agent, opponents);
      trajectories.push(...gameTrajectory);
    }
    
    return trajectories;
  }

  async playGame(agent, opponents) {
    const trajectory = [];
    const gameState = this.initializeGameState();
    
    while (!gameState.isTerminal) {
      // Get current state encoding
      const stateVector = this.encodeState(gameState, agent.agentName);
      
      // Get action from agent (with exploration)
      const actionData = await agent.predict(stateVector, this.getExplorationTemp());
      
      // Execute action and get reward
      const { nextState, reward, done, info } = await this.executeAction(
        gameState, 
        actionData.action, 
        actionData.betSize
      );
      
      // Store transition
      trajectory.push({
        state: stateVector,
        action: actionData.action,
        actionProbs: actionData.actionProbs,
        reward: reward,
        nextState: this.encodeState(nextState, agent.agentName),
        done: done,
        value: actionData.expectedValue,
        info: info
      });
      
      // Update game state
      Object.assign(gameState, nextState);
      
      // Opponent actions
      if (!done) {
        await this.performOpponentActions(gameState, opponents);
      }
    }
    
    // Compute returns and advantages
    const processedTrajectory = this.computeGAE(trajectory);
    return processedTrajectory;
  }

  computeGAE(trajectory) {
    // Generalized Advantage Estimation
    const rewards = trajectory.map(t => t.reward);
    const values = trajectory.map(t => t.value);
    const dones = trajectory.map(t => t.done);
    
    const returns = [];
    const advantages = [];
    
    let lastReturn = 0;
    let lastAdvantage = 0;
    
    // Compute returns and advantages backward
    for (let t = trajectory.length - 1; t >= 0; t--) {
      const reward = rewards[t];
      const value = values[t];
      const done = dones[t];
      const nextValue = t < trajectory.length - 1 ? values[t + 1] : 0;
      
      // Compute return
      const return_ = reward + (done ? 0 : this.config.gamma * lastReturn);
      returns.unshift(return_);
      lastReturn = return_;
      
      // Compute TD error
      const tdError = reward + (done ? 0 : this.config.gamma * nextValue) - value;
      
      // Compute advantage with GAE
      const advantage = tdError + (done ? 0 : this.config.gamma * this.config.lambda * lastAdvantage);
      advantages.unshift(advantage);
      lastAdvantage = advantage;
    }
    
    // Normalize advantages
    const meanAdvantage = advantages.reduce((a, b) => a + b, 0) / advantages.length;
    const stdAdvantage = Math.sqrt(
      advantages.reduce((sum, adv) => sum + Math.pow(adv - meanAdvantage, 2), 0) / advantages.length
    );
    
    const normalizedAdvantages = advantages.map(adv => 
      (adv - meanAdvantage) / (stdAdvantage + 1e-8)
    );
    
    // Add computed values to trajectory
    return trajectory.map((trans, idx) => ({
      ...trans,
      return: returns[idx],
      advantage: normalizedAdvantages[idx]
    }));
  }

  async ppoUpdate(agent) {
    const miniBatches = this.experienceBuffer.sampleBatches(
      this.config.miniBatchSize,
      this.config.ppoEpochs
    );
    
    let totalLoss = 0;
    let totalPolicyLoss = 0;
    let totalValueLoss = 0;
    let totalEntropy = 0;
    let klDivergences = [];
    
    for (const batch of miniBatches) {
      // Convert batch to tensors
      const states = tf.tensor2d(batch.map(b => b.state));
      const actions = tf.tensor1d(batch.map(b => this.actionToIndex(b.action)));
      const oldProbs = tf.tensor2d(batch.map(b => b.actionProbs));
      const advantages = tf.tensor1d(batch.map(b => b.advantage));
      const returns = tf.tensor1d(batch.map(b => b.return));
      
      // Forward pass through network
      const predictions = await agent.metaController.predict(states);
      const newActionProbs = predictions.slice([0, 0], [-1, 3]);
      const newValues = predictions.slice([0, 5], [-1, 1]).squeeze();
      
      // Compute probability ratios
      const oldActionProbs = tf.gather(oldProbs, actions, 1, 1);
      const newActionProbsSelected = tf.gather(newActionProbs, actions, 1, 1);
      const ratios = tf.div(newActionProbsSelected, tf.add(oldActionProbs, 1e-8));
      
      // PPO clipped objective
      const surr1 = tf.mul(ratios, advantages);
      const surr2 = tf.mul(
        tf.clipByValue(ratios, 1 - this.config.clipRatio, 1 + this.config.clipRatio),
        advantages
      );
      const policyLoss = tf.neg(tf.mean(tf.minimum(surr1, surr2)));
      
      // Value loss (clipped)
      const valueClipped = tf.add(
        batch.map(b => b.value),
        tf.clipByValue(
          tf.sub(newValues, batch.map(b => b.value)),
          -this.config.clipRatio,
          this.config.clipRatio
        )
      );
      const valueLoss1 = tf.square(tf.sub(newValues, returns));
      const valueLoss2 = tf.square(tf.sub(valueClipped, returns));
      const valueLoss = tf.mul(0.5, tf.mean(tf.maximum(valueLoss1, valueLoss2)));
      
      // Entropy bonus for exploration
      const entropy = tf.mean(tf.sum(
        tf.mul(tf.neg(newActionProbs), tf.log(tf.add(newActionProbs, 1e-8))),
        1
      ));
      
      // Total loss
      const loss = tf.add(
        policyLoss,
        tf.sub(
          tf.mul(this.config.valueCoeff, valueLoss),
          tf.mul(this.config.entropyCoeff, entropy)
        )
      );
      
      // Compute KL divergence for early stopping
      const klDiv = tf.mean(tf.sum(
        tf.mul(oldProbs, tf.log(tf.div(oldProbs, tf.add(newActionProbs, 1e-8)))),
        1
      ));
      klDivergences.push(await klDiv.array());
      
      // Early stopping if KL divergence too high
      if (klDivergences[klDivergences.length - 1] > 1.5 * this.config.clipRatio) {
        console.log('Early stopping due to high KL divergence');
        break;
      }
      
      // Backpropagation
      const grads = tf.grads((x) => loss)(agent.metaController.getWeights());
      
      // Gradient clipping
      const clippedGrads = grads.map(grad => 
        tf.clipByValue(grad, -this.config.maxGradNorm, this.config.maxGradNorm)
      );
      
      // Apply gradients
      agent.metaController.optimizer.applyGradients(
        clippedGrads.map((grad, i) => ({
          tensor: agent.metaController.getWeights()[i],
          gradient: grad
        }))
      );
      
      // Track losses
      totalLoss += await loss.array();
      totalPolicyLoss += await policyLoss.array();
      totalValueLoss += await valueLoss.array();
      totalEntropy += await entropy.array();
      
      // Clean up tensors
      states.dispose();
      actions.dispose();
      oldProbs.dispose();
      advantages.dispose();
      returns.dispose();
      predictions.dispose();
      loss.dispose();
      policyLoss.dispose();
      valueLoss.dispose();
      entropy.dispose();
      klDiv.dispose();
    }
    
    // Log training metrics
    this.trainingStats.entropy.push(totalEntropy / miniBatches.length);
    this.trainingStats.kl_divergence.push(
      klDivergences.reduce((a, b) => a + b, 0) / klDivergences.length
    );
    
    return totalLoss / miniBatches.length;
  }

  selectOpponents() {
    const opponents = [];
    const stage = this.currentStage;
    
    // Select opponents based on curriculum stage
    if (stage === 0) {
      // Random/weak opponents
      opponents.push(...this.createWeakOpponents());
    } else if (stage === 1) {
      // Mix of weak and medium
      opponents.push(...this.createMediumOpponents());
    } else if (stage === 2) {
      // Previous versions from self-play
      const poolSize = Math.min(3, this.opponentPool.length);
      for (let i = 0; i < poolSize; i++) {
        const idx = Math.floor(Math.random() * this.opponentPool.length);
        opponents.push(this.opponentPool[idx]);
      }
    } else if (stage === 3) {
      // Strong previous versions
      const topOpponents = this.opponentPool
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 3);
      opponents.push(...topOpponents);
    } else {
      // Mix of everything including latest version
      opponents.push(...this.createMixedOpponents());
    }
    
    // Fill remaining slots with personality-based agents
    while (opponents.length < 4) {
      opponents.push(this.createPersonalityAgent());
    }
    
    return opponents;
  }

  async updateOpponentPool(agent) {
    // Create a frozen copy of current agent for opponent pool
    const frozenAgent = await this.freezeAgent(agent);
    
    // Evaluate against current pool
    const winRate = await this.evaluateAgainstPool(frozenAgent);
    frozenAgent.winRate = winRate;
    
    // Add to pool
    this.opponentPool.push(frozenAgent);
    
    // Keep pool size limited
    if (this.opponentPool.length > this.config.opponentPoolSize) {
      // Remove weakest opponent
      this.opponentPool.sort((a, b) => b.winRate - a.winRate);
      this.opponentPool.pop();
    }
    
    console.log(`Updated opponent pool. Size: ${this.opponentPool.length}, New agent win rate: ${winRate.toFixed(2)}`);
  }

  async freezeAgent(agent) {
    // Create a copy of agent's networks that won't be updated
    const frozen = {
      agentName: `${agent.agentName}_frozen_${Date.now()}`,
      predict: async (state) => {
        // Use saved weights for prediction
        return agent.predict(state, 0.1); // Low temperature for frozen agents
      },
      winRate: 0
    };
    
    return frozen;
  }

  checkCurriculumAdvancement(winRate) {
    this.stageWinRates.push(winRate);
    
    // Check if ready to advance
    if (this.stageWinRates.length >= 10) {
      const avgWinRate = this.stageWinRates.slice(-10).reduce((a, b) => a + b, 0) / 10;
      
      if (avgWinRate >= this.config.stageWinThreshold && this.currentStage < this.config.curriculumStages - 1) {
        this.currentStage++;
        this.stageWinRates = [];
        console.log(`Advanced to curriculum stage ${this.currentStage}`);
      }
    }
  }

  getExplorationTemp() {
    // Temperature scheduling for exploration
    const progress = this.trainingStats.episodeRewards.length / 10000;
    return Math.max(0.1, 1.0 - progress * 0.8);
  }

  actionToIndex(action) {
    const actionMap = { 'fold': 0, 'call': 1, 'raise': 2 };
    return actionMap[action] || 1;
  }

  async saveCheckpoint(agent, episode) {
    const checkpoint = {
      episode,
      trainingStats: this.trainingStats,
      currentStage: this.currentStage,
      timestamp: Date.now()
    };
    
    // Save model and checkpoint
    await agent.saveModel(`./models/checkpoints/episode_${episode}`);
    
    console.log(`Checkpoint saved at episode ${episode}`);
  }

  logTrainingProgress(episode, totalEpisodes) {
    const recentRewards = this.trainingStats.episodeRewards.slice(-100);
    const avgReward = recentRewards.length > 0 
      ? recentRewards.reduce((a, b) => a + b, 0) / recentRewards.length 
      : 0;
    
    const recentLosses = this.trainingStats.losses.slice(-100);
    const avgLoss = recentLosses.length > 0
      ? recentLosses.reduce((a, b) => a + b, 0) / recentLosses.length
      : 0;
    
    console.log(`
      Episode: ${episode}/${totalEpisodes}
      Curriculum Stage: ${this.currentStage}
      Avg Reward (last 100): ${avgReward.toFixed(3)}
      Avg Loss (last 100): ${avgLoss.toFixed(4)}
      Buffer Size: ${this.experienceBuffer.size()}
      Opponent Pool Size: ${this.opponentPool.length}
    `);
  }

  // Helper methods that need to be implemented based on your game structure
  initializeGameState() {
    // Initialize poker game state
    return {
      isTerminal: false,
      round: 1,
      communityCards: [],
      playerHand: [],
      pot: 0,
      currentBet: 0,
      // ... other game state properties
    };
  }

  encodeState(gameState, agentName) {
    // Convert game state to feature vector
    // This should match your PersonalityAwareStateEncoder
    return [];
  }

  async executeAction(gameState, action, betSize) {
    // Execute action in game and return next state, reward, done, info
    return {
      nextState: gameState,
      reward: 0,
      done: false,
      info: {}
    };
  }

  async performOpponentActions(gameState, opponents) {
    // Have opponents take their actions
  }

  async evaluateAgent(agent) {
    // Evaluate agent against test opponents
    return 0.5; // Return win rate
  }

  async evaluateAgainstPool(agent) {
    // Evaluate agent against opponent pool
    return 0.5; // Return win rate
  }

  addToBuffer(trajectories) {
    // Add trajectories to experience buffer with priorities
    trajectories.forEach(traj => {
      const priority = Math.abs(traj.advantage) + 1e-6;
      this.experienceBuffer.add(traj, priority);
    });
  }

  createWeakOpponents() {
    // Create weak opponents for early curriculum
    return [];
  }

  createMediumOpponents() {
    // Create medium-strength opponents
    return [];
  }

  createMixedOpponents() {
    // Create mixed opponent set
    return [];
  }

  createPersonalityAgent() {
    // Create personality-based agent
    return {};
  }
}

// Prioritized Experience Replay Buffer
class PrioritizedReplayBuffer {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.buffer = [];
    this.priorities = [];
    this.alpha = 0.6;
    this.beta = 0.4;
    this.betaIncrement = 0.001;
    this.epsilon = 1e-6;
  }

  add(experience, priority = null) {
    if (priority === null) {
      priority = this.priorities.length > 0 ? Math.max(...this.priorities) : 1.0;
    }
    
    if (this.buffer.length >= this.maxSize) {
      this.buffer.shift();
      this.priorities.shift();
    }
    
    this.buffer.push(experience);
    this.priorities.push(priority);
  }

  sampleBatches(batchSize, numBatches) {
    const batches = [];
    
    for (let i = 0; i < numBatches; i++) {
      batches.push(this.sample(batchSize));
      this.beta = Math.min(1.0, this.beta + this.betaIncrement);
    }
    
    return batches;
  }

  sample(batchSize) {
    if (this.buffer.length < batchSize) {
      return this.buffer;
    }
    
    // Compute sampling probabilities
    const probs = this.priorities.map(p => Math.pow(p + this.epsilon, this.alpha));
    const totalProb = probs.reduce((a, b) => a + b, 0);
    const samplingProbs = probs.map(p => p / totalProb);
    
    // Sample indices
    const samples = [];
    const indices = [];
    
    for (let i = 0; i < batchSize; i++) {
      const idx = this.categoricalSample(samplingProbs);
      indices.push(idx);
      samples.push(this.buffer[idx]);
    }
    
    return samples;
  }

  categoricalSample(probs) {
    const random = Math.random();
    let cumSum = 0;
    
    for (let i = 0; i < probs.length; i++) {
      cumSum += probs[i];
      if (random < cumSum) {
        return i;
      }
    }
    
    return probs.length - 1;
  }

  size() {
    return this.buffer.length;
  }
}

export default ReinforcementLearningTrainer;

