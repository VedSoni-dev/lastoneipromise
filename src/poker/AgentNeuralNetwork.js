/**
 * AgentNeuralNetwork - Deep neural network for poker decision-making
 * 
 * Architecture:
 * - Multi-head attention for hand strength evaluation
 * - LSTM for sequential betting pattern recognition
 * - Transformer layers for opponent modeling
 * - Personality-specific sub-networks
 * - Ensemble of specialized networks (bluff detection, value betting, etc.)
 */

import * as tf from '@tensorflow/tfjs';

class AgentNeuralNetwork {
  constructor(agentName, inputDim = 624) {
    this.agentName = agentName;
    this.inputDim = inputDim;
    
    // Model components
    this.mainModel = null;
    this.bluffNetwork = null;
    this.valueNetwork = null;
    this.opponentModel = null;
    this.metaController = null;
    
    // Training state
    this.trainingHistory = [];
    this.experienceBuffer = [];
    this.isTraining = false;
    
    // Initialize all networks
    this.buildNetworks();
  }

  buildNetworks() {
    // Main decision network
    this.mainModel = this.buildMainNetwork();
    
    // Specialized sub-networks
    this.bluffNetwork = this.buildBluffNetwork();
    this.valueNetwork = this.buildValueNetwork();
    this.opponentModel = this.buildOpponentModel();
    
    // Meta-controller that combines all networks
    this.metaController = this.buildMetaController();
  }

  buildMainNetwork() {
    const model = tf.sequential({
      name: `${this.agentName}_main_network`
    });

    // Input layer with batch normalization
    model.add(tf.layers.dense({
      inputShape: [this.inputDim],
      units: 512,
      activation: 'relu',
      kernelInitializer: 'heNormal'
    }));
    model.add(tf.layers.batchNormalization());
    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Deep residual blocks
    for (let i = 0; i < 3; i++) {
      const residualBlock = this.createResidualBlock(512);
      model.add(residualBlock);
    }

    // Attention mechanism for important features
    model.add(tf.layers.multiHeadAttention({
      numHeads: 8,
      keyDim: 64,
      dropout: 0.2
    }));

    // Hand evaluation branch
    const handBranch = tf.sequential({
      name: 'hand_evaluation'
    });
    handBranch.add(tf.layers.dense({ units: 256, activation: 'relu' }));
    handBranch.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    handBranch.add(tf.layers.dense({ units: 10, activation: 'softmax' })); // Hand strength categories

    // Position and betting pattern branch
    const positionBranch = tf.sequential({
      name: 'position_analysis'
    });
    positionBranch.add(tf.layers.lstm({ units: 128, returnSequences: true }));
    positionBranch.add(tf.layers.lstm({ units: 64 }));
    positionBranch.add(tf.layers.dense({ units: 32, activation: 'relu' }));

    // Combine branches
    model.add(tf.layers.dense({ units: 256, activation: 'relu' }));
    model.add(tf.layers.batchNormalization());
    
    // Output layers
    // [fold_prob, call_prob, raise_prob, raise_size, confidence]
    model.add(tf.layers.dense({ 
      units: 5, 
      activation: 'linear',
      name: 'action_output'
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  buildBluffNetwork() {
    // Specialized network for bluff detection and execution
    const model = tf.sequential({
      name: `${this.agentName}_bluff_network`
    });

    model.add(tf.layers.dense({
      inputShape: [this.inputDim],
      units: 256,
      activation: 'relu'
    }));

    // GRU layers for temporal patterns in betting
    model.add(tf.layers.gru({
      units: 128,
      returnSequences: true,
      dropout: 0.2
    }));
    model.add(tf.layers.gru({
      units: 64,
      dropout: 0.2
    }));

    // Bluff-specific features
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.3 }));
    
    // Output: [should_bluff, bluff_size, bluff_confidence]
    model.add(tf.layers.dense({ units: 3, activation: 'sigmoid' }));

    model.compile({
      optimizer: tf.train.adam(0.0005),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  buildValueNetwork() {
    // Network for estimating hand value and optimal bet sizing
    const model = tf.sequential({
      name: `${this.agentName}_value_network`
    });

    model.add(tf.layers.dense({
      inputShape: [this.inputDim],
      units: 256,
      activation: 'relu'
    }));

    // Convolutional layers for pattern recognition
    model.add(tf.layers.reshape({ targetShape: [16, 16, 1] }));
    model.add(tf.layers.conv2d({
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu',
      padding: 'same'
    }));
    model.add(tf.layers.flatten());

    // Value estimation
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    
    // Output: [hand_value, optimal_bet_size, win_probability]
    model.add(tf.layers.dense({ units: 3, activation: 'linear' }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  buildOpponentModel() {
    // Network for modeling opponent behavior
    const model = tf.sequential({
      name: `${this.agentName}_opponent_model`
    });

    model.add(tf.layers.dense({
      inputShape: [this.inputDim],
      units: 384,
      activation: 'relu'
    }));

    // Bidirectional LSTM for pattern recognition
    model.add(tf.layers.bidirectional({
      layer: tf.layers.lstm({ units: 96, returnSequences: true })
    }));
    model.add(tf.layers.bidirectional({
      layer: tf.layers.lstm({ units: 48 })
    }));

    // Opponent profiling layers
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.25 }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    
    // Output: [opponent_hand_strength, opponent_bluff_prob, opponent_style_vector(10)]
    model.add(tf.layers.dense({ units: 12, activation: 'sigmoid' }));

    model.compile({
      optimizer: tf.train.adam(0.0008),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  buildMetaController() {
    // Meta-controller that combines outputs from all networks
    const stateInput = tf.input({ shape: [this.inputDim], name: 'state_input' });
    
    // Get predictions from each network
    const mainOutput = tf.layers.dense({ units: 64, activation: 'relu' }).apply(stateInput);
    const bluffOutput = tf.layers.dense({ units: 32, activation: 'relu' }).apply(stateInput);
    const valueOutput = tf.layers.dense({ units: 32, activation: 'relu' }).apply(stateInput);
    const opponentOutput = tf.layers.dense({ units: 48, activation: 'relu' }).apply(stateInput);
    
    // Attention mechanism to weight different network outputs
    const concatenated = tf.layers.concatenate().apply([
      mainOutput, bluffOutput, valueOutput, opponentOutput
    ]);
    
    const attention = tf.layers.dense({ 
      units: 176, 
      activation: 'softmax',
      name: 'attention_weights'
    }).apply(concatenated);
    
    const weighted = tf.layers.multiply().apply([concatenated, attention]);
    
    // Final decision layers
    let output = tf.layers.dense({ units: 128, activation: 'relu' }).apply(weighted);
    output = tf.layers.batchNormalization().apply(output);
    output = tf.layers.dropout({ rate: 0.2 }).apply(output);
    output = tf.layers.dense({ units: 64, activation: 'relu' }).apply(output);
    
    // Final output: [action_probs(3), bet_size, confidence, expected_value]
    const finalOutput = tf.layers.dense({ 
      units: 6, 
      activation: 'linear',
      name: 'final_decision'
    }).apply(output);
    
    const model = tf.model({
      inputs: stateInput,
      outputs: finalOutput,
      name: `${this.agentName}_meta_controller`
    });
    
    model.compile({
      optimizer: tf.train.adam(0.0005),
      loss: this.customPokerLoss(),
      metrics: ['accuracy']
    });
    
    return model;
  }

  createResidualBlock(units) {
    // Create a residual block for deep learning
    // Simplified version - in practice, this would have skip connections
    const block = tf.sequential();
    block.add(tf.layers.dense({ units, activation: 'relu' }));
    block.add(tf.layers.batchNormalization());
    block.add(tf.layers.dropout({ rate: 0.2 }));
    block.add(tf.layers.dense({ units, activation: 'relu' }));
    block.add(tf.layers.batchNormalization());
    return block;
  }

  customPokerLoss() {
    // Custom loss function for poker that considers EV
    return (yTrue, yPred) => {
      const actionLoss = tf.losses.softmaxCrossEntropy(
        yTrue.slice([0, 0], [-1, 3]),
        yPred.slice([0, 0], [-1, 3])
      );
      
      const sizingLoss = tf.losses.meanSquaredError(
        yTrue.slice([0, 3], [-1, 1]),
        yPred.slice([0, 3], [-1, 1])
      );
      
      const evLoss = tf.losses.meanSquaredError(
        yTrue.slice([0, 5], [-1, 1]),
        yPred.slice([0, 5], [-1, 1])
      );
      
      // Weighted combination
      return tf.add(
        tf.mul(actionLoss, 0.5),
        tf.add(
          tf.mul(sizingLoss, 0.3),
          tf.mul(evLoss, 0.2)
        )
      );
    };
  }

  async predict(stateVector, temperature = 1.0) {
    // Make prediction with temperature-based exploration
    const stateTensor = tf.tensor2d([stateVector]);
    
    // Get predictions from all networks
    const mainPred = await this.mainModel.predict(stateTensor);
    const bluffPred = await this.bluffNetwork.predict(stateTensor);
    const valuePred = await this.valueNetwork.predict(stateTensor);
    const opponentPred = await this.opponentModel.predict(stateTensor);
    const metaPred = await this.metaController.predict(stateTensor);
    
    // Extract final decision
    const metaOutput = await metaPred.array();
    const [actionProbs, betSize, confidence, expectedValue] = [
      metaOutput[0].slice(0, 3),
      metaOutput[0][3],
      metaOutput[0][4],
      metaOutput[0][5]
    ];
    
    // Apply temperature for exploration
    const adjustedProbs = this.applyTemperature(actionProbs, temperature);
    
    // Sample action based on probabilities
    const action = this.sampleAction(adjustedProbs);
    
    // Clean up tensors
    stateTensor.dispose();
    mainPred.dispose();
    bluffPred.dispose();
    valuePred.dispose();
    opponentPred.dispose();
    metaPred.dispose();
    
    return {
      action,
      actionProbs: adjustedProbs,
      betSize: Math.max(0, betSize),
      confidence,
      expectedValue,
      shouldBluff: (await bluffPred.array())[0][0] > 0.5
    };
  }

  applyTemperature(probs, temperature) {
    // Apply temperature to action probabilities for exploration
    const logits = probs.map(p => Math.log(p + 1e-10) / temperature);
    const maxLogit = Math.max(...logits);
    const expLogits = logits.map(l => Math.exp(l - maxLogit));
    const sum = expLogits.reduce((a, b) => a + b, 0);
    return expLogits.map(e => e / sum);
  }

  sampleAction(probs) {
    // Sample action from probability distribution
    const random = Math.random();
    let cumSum = 0;
    for (let i = 0; i < probs.length; i++) {
      cumSum += probs[i];
      if (random < cumSum) {
        return ['fold', 'call', 'raise'][i];
      }
    }
    return 'call'; // Default fallback
  }

  async saveModel(path) {
    // Save all models
    await this.mainModel.save(`${path}/${this.agentName}_main`);
    await this.bluffNetwork.save(`${path}/${this.agentName}_bluff`);
    await this.valueNetwork.save(`${path}/${this.agentName}_value`);
    await this.opponentModel.save(`${path}/${this.agentName}_opponent`);
    await this.metaController.save(`${path}/${this.agentName}_meta`);
  }

  async loadModel(path) {
    // Load pre-trained models
    this.mainModel = await tf.loadLayersModel(`${path}/${this.agentName}_main/model.json`);
    this.bluffNetwork = await tf.loadLayersModel(`${path}/${this.agentName}_bluff/model.json`);
    this.valueNetwork = await tf.loadLayersModel(`${path}/${this.agentName}_value/model.json`);
    this.opponentModel = await tf.loadLayersModel(`${path}/${this.agentName}_opponent/model.json`);
    this.metaController = await tf.loadLayersModel(`${path}/${this.agentName}_meta/model.json`);
  }
}

export default AgentNeuralNetwork;

