import { useState, useEffect, useRef } from 'react'
import './Poker.css'

// Opponent personalities
const OPPONENT_PERSONALITIES = [
  {
    name: 'Alex',
    personality: 'aggressive and confident. loves to bluff and raise. talks trash but backs it up. responds to challenges.',
    traits: ['aggressive', 'confident', 'bluffing', 'competitive'],
    decisionStyle: 'tends to raise with decent hands, bluffs often, rarely folds'
  },
  {
    name: 'Sam',
    personality: 'cautious and analytical. thinks carefully before acting. polite and strategic. responds to logic.',
    traits: ['cautious', 'analytical', 'strategic', 'polite'],
    decisionStyle: 'only bets with strong hands, folds weak hands, very conservative'
  },
  {
    name: 'Jordan',
    personality: 'wild and unpredictable. makes bold moves. friendly but chaotic. responds to energy and excitement.',
    traits: ['unpredictable', 'bold', 'friendly', 'chaotic'],
    decisionStyle: 'makes random-seeming moves, sometimes bluffs with nothing, sometimes folds strong hands'
  },
  {
    name: 'Casey',
    personality: 'balanced and observant. adapts to the table. reads opponents well. professional but approachable.',
    traits: ['balanced', 'observant', 'adaptive', 'professional'],
    decisionStyle: 'plays the player, not just the cards. adapts strategy based on opponent history.'
  }
]

// LLM API integration with retry logic - Using Google Gemini (Free Tier)
const callLLMWithRetry = async (messages, personality, gameContext, retries = 3) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    console.warn(`⚠️ ${personality.name}: Gemini API key not found. Using fallback AI.`)
    return { response: getMockResponse(messages, personality, gameContext), isAI: false }
  }

  console.log(`🤖 ${personality.name}: Making real AI call to Gemini API...`)

  // Calculate pot odds
  const potOdds = gameContext.pot > 0 && gameContext.currentBet > 0
    ? (gameContext.currentBet / (gameContext.pot + gameContext.currentBet)).toFixed(2)
    : '0'

  // Build enhanced system prompt with Chain of Thought
  const systemPrompt = `You are ${personality.name}, an expert poker player AI.
  
PERSONALITY: ${personality.personality}
TRAITS: ${personality.traits.join(', ')}
DECISION STYLE: ${personality.decisionStyle}

CURRENT GAME STATE:
- Round: ${gameContext.round}/5
- Betting Stage: ${gameContext.stage}
- Community Cards: ${gameContext.communityCards?.map(c => `${c.value}${c.suit}`).join(', ') || 'None (pre-flop)'}
- Your Hole Cards: ${gameContext.hand.map(c => `${c.value}${c.suit}`).join(', ')}
- Your Best Hand: ${gameContext.handStrength.name} (rank ${gameContext.handStrength.rank})
- Your Chips: ${gameContext.chips}
- Pot Size: ${gameContext.pot}
- Current Bet to Call: ${gameContext.currentBet}
- Pot Odds: ${potOdds}
- Amount to Call: ${gameContext.currentBet - (gameContext.betThisRound || 0)}

CONVERSATION HISTORY:
${messages.length > 0 ? messages.map(msg => `${msg.role === 'user' ? 'Player' : personality.name}: ${msg.content}`).join('\n') : 'No previous conversation.'}

INSTRUCTIONS:
1. Analyze the situation deeply. Consider your hand strength, position, pot odds, and opponent behavior.
2. Formulate a strategy consistent with your personality.
3. Decide on an action: [FOLD], [CALL], or [RAISE].
4. Generate a short, in-character chat message.

OUTPUT FORMAT:
You must respond with a valid JSON object strictly following this schema:
{
  "thought_process": "Your internal monologue analyzing the hand and situation.",
  "strategy": "Your current strategic approach (e.g., 'bluffing', 'trapping', 'playing safe').",
  "action": "FOLD" | "CALL" | "RAISE",
  "chat": "Your in-character message to the table."
}
`

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000)

      const modelConfigs = [
        { model: 'gemini-2.0-flash', version: 'v1beta' },
        { model: 'gemini-1.5-flash', version: 'v1beta' },
        { model: 'gemini-1.5-pro', version: 'v1beta' }
      ]

      const modelConfig = modelConfigs[Math.min(attempt - 1, modelConfigs.length - 1)]
      const apiUrl = `https://generativelanguage.googleapis.com/${modelConfig.version}/models/${modelConfig.model}:generateContent?key=${apiKey}`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.9,
            responseMimeType: "application/json"
          },
          signal: controller.signal
        })
      })

      clearTimeout(timeoutId)
      const data = await response.json()

      if (data.error) throw new Error(data.error.message)

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) throw new Error('Empty response')

      console.log(`✅ ${personality.name} thought:`, text)

      try {
        const parsed = JSON.parse(text)
        return { ...parsed, isAI: true }
      } catch (e) {
        console.warn('Failed to parse JSON, falling back to regex extraction', text)
        // Fallback parsing if JSON fails
        const actionMatch = text.match(/\[(FOLD|CALL|RAISE)\]/)
        return {
          thought_process: "Failed to parse thought.",
          strategy: "Unknown",
          action: actionMatch ? actionMatch[1] : "CALL",
          chat: text.replace(/\[.*?\]/g, '').trim(),
          isAI: true
        }
      }

    } catch (error) {
      console.error(`LLM error (attempt ${attempt}):`, error)
      if (attempt === retries) {
        return { ...getMockResponse(messages, personality, gameContext), isAI: false }
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
  return { ...getMockResponse(messages, personality, gameContext), isAI: false }
}

// Legacy wrapper for backward compatibility
const callLLM = async (messages, personality, gameContext) => {
  const result = await callLLMWithRetry(messages, personality, gameContext)
  return result.response
}

const getMockResponse = (messages, personality, gameContext) => {
  const lastMessage = messages[messages.length - 1]?.content || ''
  const handEval = gameContext.handStrength
  const traits = personality.traits
  const communityCards = gameContext.communityCards || []
  const stage = gameContext.stage

  // Generate more varied, context-aware responses
  const aggressiveResponses = [
    "I'm all in on this one!",
    "You think you can scare me? Try harder.",
    "Let me show you how it's done.",
    "This hand is mine, calling it now.",
    "I've got a feeling about this board.",
    "Time to make you pay to see my cards.",
  ]

  const cautiousResponses = [
    "This board makes me nervous...",
    "Let me calculate the odds here.",
    "I need to be careful with this one.",
    "Not liking what I'm seeing on the board.",
    "The pot odds aren't in my favor.",
    "I'll proceed cautiously.",
  ]

  const unpredictableResponses = [
    "Screw it, let's gamble!",
    "My gut says go for it!",
    "Why not? Life's too short!",
    "This could be fun or terrible.",
    "I'm feeling chaotic energy right now.",
    "Let's shake things up!",
  ]

  // Determine action based on hand strength, stage, and personality
  let action = '[FOLD]'
  let reasoning = ''

  // Stronger logic based on actual game state
  if (handEval.rank >= 4) { // Straight or better
    action = traits.includes('cautious') ? '[CALL]' : '[RAISE]'
    reasoning = traits.includes('aggressive') ? aggressiveResponses[Math.floor(Math.random() * aggressiveResponses.length)] : ''
  } else if (handEval.rank >= 2) { // Two pair or better
    if (stage === 'river') {
      action = traits.includes('aggressive') ? '[RAISE]' : '[CALL]'
    } else {
      action = traits.includes('cautious') ? '[CALL]' : (Math.random() > 0.5 ? '[RAISE]' : '[CALL]')
    }
  } else if (handEval.rank === 1) { // Pair
    if (communityCards.length >= 3 && Math.random() > 0.6) {
      action = '[FOLD]'
      reasoning = traits.includes('cautious') ? cautiousResponses[Math.floor(Math.random() * cautiousResponses.length)] : ''
    } else {
      action = traits.includes('cautious') ? '[FOLD]' : '[CALL]'
    }
  } else { // High card
    if (handEval.high >= 13) { // Ace or King high
      action = traits.includes('aggressive') && Math.random() > 0.5 ? '[CALL]' : '[FOLD]'
    } else {
      // Random bluff chance for unpredictable/aggressive
      if ((traits.includes('unpredictable') || traits.includes('aggressive')) && Math.random() > 0.8) {
        action = '[RAISE]'
        reasoning = "Bluffing with nothing!"
      } else {
        action = traits.includes('unpredictable') && Math.random() > 0.7 ? '[CALL]' : '[FOLD]'
      }
    }
  }

  // Generate response based on personality
  const trait = traits[Math.floor(Math.random() * traits.length)]
  let response = ''

  if (trait === 'aggressive') {
    response = aggressiveResponses[Math.floor(Math.random() * aggressiveResponses.length)]
  } else if (trait === 'cautious') {
    response = cautiousResponses[Math.floor(Math.random() * cautiousResponses.length)]
  } else {
    response = unpredictableResponses[Math.floor(Math.random() * unpredictableResponses.length)]
  }

  return {
    thought_process: "Mock AI thinking...",
    strategy: "Basic heuristic",
    action: action.replace('[', '').replace(']', ''),
    chat: response,
    isAI: false
  }
}

const parseAction = (response) => {
  if (response.includes('[RAISE]')) return 'raise'
  if (response.includes('[CALL]')) return 'call'
  if (response.includes('[FOLD]')) return 'fold'
  // Default based on response tone
  if (response.toLowerCase().includes('raise') || response.toLowerCase().includes('up')) return 'raise'
  if (response.toLowerCase().includes('fold') || response.toLowerCase().includes('out')) return 'fold'
  return 'call'
}

function Poker({ onWin }) {
  const [gameState, setGameState] = useState('menu')
  const [currentRound, setCurrentRound] = useState(1)
  const [deck, setDeck] = useState([])
  const [communityCards, setCommunityCards] = useState([])
  const [playerHand, setPlayerHand] = useState([])
  const [opponentHands, setOpponentHands] = useState([[], [], [], []])
  const [showCards, setShowCards] = useState(false)
  const [message, setMessage] = useState('')
  const [currentBet, setCurrentBet] = useState(0)
  const [playerChips, setPlayerChips] = useState(1000)
  const [opponentChips, setOpponentChips] = useState([1000, 1000, 1000, 1000])
  const [pot, setPot] = useState(0)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [bettingStage, setBettingStage] = useState('pre-flop') // pre-flop, flop, turn, river
  const [playerBetThisRound, setPlayerBetThisRound] = useState(0)
  const [opponentBetsThisRound, setOpponentBetsThisRound] = useState([0, 0, 0, 0])
  const [foldedPlayers, setFoldedPlayers] = useState([false, false, false, false, false])
  const [showRules, setShowRules] = useState(false)
  const [actionLog, setActionLog] = useState([])
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [isOpponentThinking, setIsOpponentThinking] = useState(false)
  const [thinkingAgent, setThinkingAgent] = useState(null) // Track which agent is thinking
  const [apiStatus, setApiStatus] = useState('') // Show API call status
  const chatEndRef = useRef(null)

  // Agent memory system - each opponent maintains independent conversation history
  const [agentMemories, setAgentMemories] = useState([
    { conversationHistory: [], gameHistory: [] }, // Alex
    { conversationHistory: [], gameHistory: [] }, // Sam
    { conversationHistory: [], gameHistory: [] }, // Jordan
    { conversationHistory: [], gameHistory: [] }  // Casey
  ])

  const suits = ['♠', '♥', '♦', '♣']
  const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']

  const scrollChatToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollChatToBottom()
  }, [chatMessages])

  // Turn management effect
  useEffect(() => {
    if (gameState !== 'playing' || currentPlayer === 0 || isOpponentThinking) return

    // It's an opponent's turn
    const timer = setTimeout(() => {
      opponentAction(currentPlayer - 1)
    }, 1500)

    return () => clearTimeout(timer)
  }, [currentPlayer, gameState])

  // Initialize agent memories at game start
  const initializeAgentMemories = () => {
    setAgentMemories([
      { conversationHistory: [], gameHistory: [] },
      { conversationHistory: [], gameHistory: [] },
      { conversationHistory: [], gameHistory: [] },
      { conversationHistory: [], gameHistory: [] }
    ])
  }

  // Update agent memory with a new message
  const updateAgentMemory = (agentIndex, message, role = 'assistant') => {
    setAgentMemories(prev => {
      const newMemories = [...prev]
      newMemories[agentIndex] = {
        ...newMemories[agentIndex],
        conversationHistory: [
          ...newMemories[agentIndex].conversationHistory,
          { role, content: message, timestamp: Date.now() }
        ]
      }
      return newMemories
    })
  }

  // Update all agent memories when player chats
  const updateAllAgentMemories = (playerMessage) => {
    setAgentMemories(prev => prev.map(memory => ({
      ...memory,
      conversationHistory: [
        ...memory.conversationHistory,
        { role: 'user', content: playerMessage, timestamp: Date.now() }
      ]
    })))
  }

  // Get agent context for AI call
  const getAgentContext = (agentIndex) => {
    const memory = agentMemories[agentIndex]
    return {
      conversationHistory: memory.conversationHistory.slice(-15), // Last 15 messages
      gameHistory: memory.gameHistory.slice(-5) // Last 5 game actions
    }
  }

  const addChatMessage = (speaker, text, isPlayer = false) => {
    setChatMessages(prev => [...prev, { speaker, text, isPlayer, timestamp: Date.now() }])
  }

  const createDeck = () => {
    const newDeck = []
    for (let suit of suits) {
      for (let value of values) {
        newDeck.push({ suit, value })
      }
    }
    return shuffleDeck(newDeck)
  }

  const shuffleDeck = (deck) => {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const getCardValue = (card) => {
    const valueMap = {
      'A': 14, 'K': 13, 'Q': 12, 'J': 11,
      '10': 10, '9': 9, '8': 8, '7': 7,
      '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
    }
    return valueMap[card.value]
  }

  // Evaluate a 5-card hand
  const evaluate5CardHand = (hand) => {
    const values = hand.map(c => getCardValue(c)).sort((a, b) => b - a)
    const suits = hand.map(c => c.suit)
    const valueCounts = {}
    values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1)

    const pairs = Object.values(valueCounts).filter(v => v === 2).length
    const threeKind = Object.values(valueCounts).some(v => v === 3)
    const fourKind = Object.values(valueCounts).some(v => v === 4)
    const flush = new Set(suits).size === 1

    // Check straight
    let straight = false
    let uniqueValues = [...new Set(values)]
    if (uniqueValues.length >= 5) {
      for (let i = 0; i <= uniqueValues.length - 5; i++) {
        if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
          straight = true
          break
        }
      }
      // Wheel straight (A, 5, 4, 3, 2)
      if (!straight && uniqueValues.includes(14) && uniqueValues.includes(2) && uniqueValues.includes(3) && uniqueValues.includes(4) && uniqueValues.includes(5)) {
        straight = true
      }
    }

    if (straight && flush) return { rank: 8, name: 'straight flush', high: values[0] }
    if (fourKind) return { rank: 7, name: 'four of a kind', high: values[0] }
    if (threeKind && pairs > 0) return { rank: 6, name: 'full house', high: values[0] }
    if (flush) return { rank: 5, name: 'flush', high: values[0] }
    if (straight) return { rank: 4, name: 'straight', high: values[0] }
    if (threeKind) return { rank: 3, name: 'three of a kind', high: values[0] }
    if (pairs === 2) return { rank: 2, name: 'two pair', high: values[0] }
    if (pairs === 1) return { rank: 1, name: 'pair', high: values[0] }
    return { rank: 0, name: 'high card', high: values[0] }
  }

  // Find best 5-card hand from hole cards + community cards
  const evaluateHand = (holeCards, community = []) => {
    const allCards = [...holeCards, ...community]
    if (allCards.length < 5) return evaluate5CardHand(allCards) // Should happen only in pre-flop visual check

    // Generate all combinations of 5 cards
    const getCombinations = (arr, k) => {
      if (k === 0) return [[]]
      if (arr.length === 0) return []
      const [head, ...tail] = arr
      const withHead = getCombinations(tail, k - 1).map(c => [head, ...c])
      const withoutHead = getCombinations(tail, k)
      return [...withHead, ...withoutHead]
    }

    const combos = getCombinations(allCards, 5)
    let bestHand = { rank: -1 }

    for (let hand of combos) {
      const evalResult = evaluate5CardHand(hand)
      if (evalResult.rank > bestHand.rank) {
        bestHand = evalResult
      } else if (evalResult.rank === bestHand.rank) {
        if (evalResult.high > bestHand.high) {
          bestHand = evalResult
        }
      }
    }

    return bestHand
  }

  const compareHands = (hand1, hand2, community) => {
    const eval1 = evaluateHand(hand1, community)
    const eval2 = evaluateHand(hand2, community)

    if (eval1.rank > eval2.rank) return 1
    if (eval1.rank < eval2.rank) return -1

    if (eval1.high > eval2.high) return 1
    if (eval1.high < eval2.high) return -1

    return 0
  }

  const startGame = () => {
    setGameState('playing')
    setCurrentRound(1)
    setPlayerChips(1000)
    setOpponentChips([1000, 1000, 1000, 1000])
    setActionLog([])
    setChatMessages([])
    initializeAgentMemories()
    addChatMessage('system', 'Welcome to the table! Meet your opponents: Alex (aggressive), Sam (cautious), and Jordan (wild).')
    startRound()
  }

  const startRound = () => {
    const newDeck = createDeck()
    const player = [newDeck.pop(), newDeck.pop()]
    const opponents = [
      [newDeck.pop(), newDeck.pop()],
      [newDeck.pop(), newDeck.pop()],
      [newDeck.pop(), newDeck.pop()],
      [newDeck.pop(), newDeck.pop()]
    ]

    setDeck(newDeck)
    setPlayerHand(player)
    setOpponentHands(opponents)
    setCommunityCards([])
    setShowCards(false)
    setMessage('')
    setBettingStage('pre-flop')
    setFoldedPlayers([false, false, false, false, false])
    setPlayerBetThisRound(0)
    setOpponentBetsThisRound([0, 0, 0, 0])

    // Reset agent conversation history for new round (keep game history)
    setAgentMemories(prev => prev.map(memory => ({
      ...memory,
      conversationHistory: [] // Clear conversation but keep game history
    })))

    const smallBlind = 10
    const bigBlind = 20
    setCurrentBet(bigBlind)
    setPlayerChips(prev => prev - bigBlind)
    setOpponentChips(prev => {
      const newChips = [...prev]
      newChips[0] -= smallBlind
      newChips[1] -= bigBlind
      return newChips
    })
    setPot(smallBlind + bigBlind + bigBlind)
    setPlayerBetThisRound(bigBlind)
    setOpponentBetsThisRound([smallBlind, bigBlind, 0, 0])
    setCurrentPlayer(2)
    setActionLog([`Round ${currentRound} started. Blinds posted.`])
    addChatMessage('system', `Round ${currentRound} begins! Blinds posted.`)
  }

  const handlePlayerChat = async () => {
    if (!chatInput.trim() || isOpponentThinking) return

    const playerMessage = chatInput.trim()
    setChatInput('')
    addChatMessage('You', playerMessage, true)

    // Update all agent memories with player's message
    updateAllAgentMemories(playerMessage)

    // If it's an opponent's turn, they can respond to chat
    if (currentPlayer > 0 && currentPlayer <= 4) {
      const opponentIndex = currentPlayer - 1
      const personality = OPPONENT_PERSONALITIES[opponentIndex]

      setIsOpponentThinking(true)
      setThinkingAgent(personality.name)
      setApiStatus('Thinking...')

      // Get agent-specific conversation history
      const agentContext = getAgentContext(opponentIndex)
      const conversationHistory = agentContext.conversationHistory

      const gameContext = {
        round: currentRound,
        stage: bettingStage,
        communityCards,
        chips: opponentChips[opponentIndex],
        pot,
        currentBet,
        betThisRound: opponentBetsThisRound[opponentIndex],
        hand: opponentHands[opponentIndex],
        handStrength: evaluateHand(opponentHands[opponentIndex], communityCards)
      }

      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY
        if (apiKey) {
          setApiStatus('Calling Gemini AI...')
          console.log(`🤖 Chat: Calling Gemini AI for ${personality.name}`)
        } else {
          setApiStatus('Using fallback AI...')
          console.log(`⚠️ Chat: No API key - using fallback for ${personality.name}`)
        }

        const result = await callLLMWithRetry(conversationHistory, personality, gameContext)

        if (result.chat) {
          addChatMessage(personality.name, result.chat)
          updateAgentMemory(opponentIndex, result.chat, 'assistant')
        }

        if (!result.isAI) {
          setApiStatus('⚠️ Using fallback AI (no API key)')
          console.warn(`⚠️ Chat: ${personality.name} using fallback AI`)
        } else {
          setApiStatus('✅ Real AI response')
          console.log(`✅ Chat: ${personality.name} using real Gemini AI`)
          setTimeout(() => setApiStatus(''), 2000)
        }
      } catch (error) {
        console.error('Chat error:', error)
        setApiStatus('Error - using fallback')
      }

      setIsOpponentThinking(false)
      setThinkingAgent(null)
      setTimeout(() => setApiStatus(''), 2000)
    }
  }

  const opponentAction = async (opponentIndex) => {
    if (foldedPlayers[opponentIndex + 1]) {
      nextPlayer(opponentIndex + 1)
      return
    }

    const hand = opponentHands[opponentIndex]
    const handEval = evaluateHand(hand, communityCards)
    const chips = opponentChips[opponentIndex]
    const betThisRound = opponentBetsThisRound[opponentIndex]
    const toCall = currentBet - betThisRound
    const personality = OPPONENT_PERSONALITIES[opponentIndex]

    setIsOpponentThinking(true)
    setThinkingAgent(personality.name)
    setApiStatus('Analyzing game state...')

    // Minimum thinking time to feel "real"
    const minThinkingTime = 2000
    const startTime = Date.now()

    // Get agent-specific conversation history (not shared chat)
    const agentContext = getAgentContext(opponentIndex)
    const conversationHistory = agentContext.conversationHistory

    const gameContext = {
      round: currentRound,
      stage: bettingStage,
      communityCards,
      chips,
      pot,
      currentBet,
      betThisRound,
      hand,
      handStrength: handEval
    }

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (apiKey) {
        setApiStatus('Calling Gemini AI...')
        console.log(`🤖 Calling Gemini AI for ${personality.name}`)
      } else {
        setApiStatus('Using fallback AI...')
        console.log(`⚠️ No API key - using fallback for ${personality.name}`)
      }

      const result = await callLLMWithRetry(conversationHistory, personality, gameContext)
      const action = result.action.toLowerCase()
      const responseText = result.chat

      // Add AI response to chat and agent memory
      if (responseText) {
        addChatMessage(personality.name, responseText)
        updateAgentMemory(opponentIndex, responseText, 'assistant')
      }

      // Update game history
      setAgentMemories(prev => {
        const newMemories = [...prev]
        newMemories[opponentIndex] = {
          ...newMemories[opponentIndex],
          gameHistory: [
            ...newMemories[opponentIndex].gameHistory,
            { stage: bettingStage, action, handStrength: handEval.name, timestamp: Date.now() }
          ]
        }
        return newMemories
      })

      if (!result.isAI) {
        setApiStatus('⚠️ Using fallback AI (no API key)')
        console.warn(`⚠️ ${personality.name} using fallback AI - no Gemini API key detected`)
      } else {
        setApiStatus('✅ Real AI response')
        console.log(`✅ ${personality.name} using real Gemini AI`)
        setTimeout(() => setApiStatus(''), 2000)
      }

      await new Promise(resolve => setTimeout(resolve, 500))

      if (action === 'fold') {
        setFoldedPlayers(prev => {
          const newFolded = [...prev]
          newFolded[opponentIndex + 1] = true

          // Check if only one player remains after this fold
          const activeCount = newFolded.filter(folded => !folded).length
          if (activeCount === 1) {
            // End round immediately - only one player left
            setTimeout(() => {
              endRound()
            }, 500)
          }

          return newFolded
        })
        setActionLog(prev => [...prev, `${personality.name} folded`])
      } else if (action === 'call') {
        const callAmount = Math.min(toCall, chips)
        if (callAmount > 0) {
          setOpponentChips(prev => {
            const newChips = [...prev]
            newChips[opponentIndex] -= callAmount
            return newChips
          })
          setPot(prev => prev + callAmount)
        }
        setOpponentBetsThisRound(prev => {
          const newBets = [...prev]
          newBets[opponentIndex] += callAmount
          return newBets
        })
        setActionLog(prev => [...prev, `${personality.name} ${callAmount === 0 ? 'checked' : `called ${callAmount}`}`])
      } else if (action === 'raise') {
        const raiseAmount = Math.max(currentBet * 2, 20)
        const totalBet = raiseAmount - betThisRound
        const actualBet = Math.min(totalBet, chips)
        setCurrentBet(raiseAmount)
        setOpponentChips(prev => {
          const newChips = [...prev]
          newChips[opponentIndex] -= actualBet
          return newChips
        })
        setPot(prev => prev + actualBet)
        setOpponentBetsThisRound(prev => {
          const newBets = [...prev]
          newBets[opponentIndex] = raiseAmount
          return newBets
        })
        setActionLog(prev => [...prev, `${personality.name} raised to ${raiseAmount}`])
        setPlayerBetThisRound(0)
        setOpponentBetsThisRound(prev => prev.map((bet, idx) => idx === opponentIndex ? raiseAmount : 0))
        setCurrentPlayer(0)
        setIsOpponentThinking(false)
        setThinkingAgent(null)
        setApiStatus('')
        return
      }
    } catch (error) {
      console.error('Opponent action error:', error)
      setApiStatus('Error - using fallback')

      // Fallback decision
      if (chips >= toCall && handEval.rank >= 1) {
        const callAmount = Math.min(toCall, chips)
        setOpponentChips(prev => {
          const newChips = [...prev]
          newChips[opponentIndex] -= callAmount
          return newChips
        })
        setPot(prev => prev + callAmount)
        setOpponentBetsThisRound(prev => {
          const newBets = [...prev]
          newBets[opponentIndex] += callAmount
          return newBets
        })
        setActionLog(prev => [...prev, `${personality.name} called ${callAmount}`])
        addChatMessage(personality.name, 'I call.')
      } else {
        setFoldedPlayers(prev => {
          const newFolded = [...prev]
          newFolded[opponentIndex + 1] = true
          return newFolded
        })
        setActionLog(prev => [...prev, `${personality.name} folded`])
        addChatMessage(personality.name, 'I fold.')
      }
    }

    // Ensure minimum thinking time
    const elapsed = Date.now() - startTime
    if (elapsed < minThinkingTime) {
      await new Promise(resolve => setTimeout(resolve, minThinkingTime - elapsed))
    }

    setIsOpponentThinking(false)
    setThinkingAgent(null)
    setTimeout(() => setApiStatus(''), 2000)
    nextPlayer(opponentIndex + 1)
  }

  const nextPlayer = (lastPlayerIndex) => {
    const current = typeof lastPlayerIndex === 'number' ? lastPlayerIndex : currentPlayer
    let next = current + 1

    // Check if only one player remains (everyone else folded)
    const activePlayers = foldedPlayers.filter(folded => !folded)
    if (activePlayers.length === 1) {
      // Only one player left - they win automatically
      endRound()
      return
    }

    if (next > 4) {
      const allBetsEqual = checkBetsEqual()
      if (allBetsEqual) {
        nextBettingStage()
      } else {
        setCurrentPlayer(0)
      }
    } else {
      // Skip folded players
      while (next <= 4 && foldedPlayers[next]) {
        next++
      }
      if (next > 4) {
        // All remaining players have acted
        const allBetsEqual = checkBetsEqual()
        if (allBetsEqual) {
          nextBettingStage()
        } else {
          // Find first non-folded player
          const firstActive = foldedPlayers.findIndex(folded => !folded)
          if (firstActive >= 0) {
            setCurrentPlayer(firstActive)
          } else {
            endRound()
          }
        }
      } else {
        setCurrentPlayer(next)
      }
    }
  }

  const nextBettingStage = () => {
    setCurrentBet(0)
    setPlayerBetThisRound(0)
    setOpponentBetsThisRound([0, 0, 0])
    setCurrentPlayer(0)

    const currentDeck = [...deck]

    if (bettingStage === 'pre-flop') {
      // Deal Flop (3 cards)
      const burn = currentDeck.pop()
      const flop = [currentDeck.pop(), currentDeck.pop(), currentDeck.pop()]
      setCommunityCards(flop)
      setDeck(currentDeck)
      setBettingStage('flop')
      setActionLog(prev => [...prev, 'Flop dealt'])
      addChatMessage('system', 'The Flop is dealt.')
    } else if (bettingStage === 'flop') {
      // Deal Turn (1 card)
      const burn = currentDeck.pop()
      const turn = currentDeck.pop()
      setCommunityCards(prev => [...prev, turn])
      setDeck(currentDeck)
      setBettingStage('turn')
      setActionLog(prev => [...prev, 'Turn dealt'])
      addChatMessage('system', 'The Turn is dealt.')
    } else if (bettingStage === 'turn') {
      // Deal River (1 card)
      const burn = currentDeck.pop()
      const river = currentDeck.pop()
      setCommunityCards(prev => [...prev, river])
      setDeck(currentDeck)
      setBettingStage('river')
      setActionLog(prev => [...prev, 'River dealt'])
      addChatMessage('system', 'The River is dealt.')
    } else {
      // Showdown
      endRound()
    }
  }

  const checkBetsEqual = () => {
    const activePlayers = foldedPlayers.map((folded, idx) => !folded)
    if (activePlayers.filter(f => f).length <= 1) return true

    const playerTotal = playerBetThisRound
    const opponentTotals = opponentBetsThisRound

    for (let i = 0; i < 4; i++) {
      if (activePlayers[i + 1] && opponentTotals[i] !== playerTotal) {
        return false
      }
    }
    return true
  }

  const playerFold = () => {
    setFoldedPlayers(prev => {
      const newFolded = [...prev]
      newFolded[0] = true
      return newFolded
    })
    setActionLog(prev => [...prev, 'You folded'])
    addChatMessage('You', 'I fold.', true)
    nextPlayer(0)
  }

  const playerCall = () => {
    const toCall = currentBet - playerBetThisRound
    if (playerChips < toCall) return

    setPlayerChips(prev => prev - toCall)
    setPot(prev => prev + toCall)
    setPlayerBetThisRound(prev => prev + toCall)
    setActionLog(prev => [...prev, `You called ${toCall} `])
    addChatMessage('You', `I call ${toCall > 0 ? toCall : 'check'}.`, true)
    nextPlayer(0)
  }

  const playerRaise = () => {
    const raiseAmount = Math.max(currentBet * 2, 20)
    const toCall = raiseAmount - playerBetThisRound
    if (playerChips < toCall) return

    setCurrentBet(raiseAmount)
    setPlayerChips(prev => prev - toCall)
    setPot(prev => prev + toCall)
    setPlayerBetThisRound(raiseAmount)
    setOpponentBetsThisRound([0, 0, 0])
    setActionLog(prev => [...prev, `You raised to ${raiseAmount} `])
    addChatMessage('You', `I raise to ${raiseAmount} !`, true)
    nextPlayer(0)
  }

  const endRound = () => {
    setShowCards(true)
    setCurrentPlayer(-1)

    const activePlayers = []
    if (!foldedPlayers[0]) {
      activePlayers.push({ index: 0, hand: playerHand, isPlayer: true })
    }
    opponentHands.forEach((hand, idx) => {
      if (!foldedPlayers[idx + 1]) {
        activePlayers.push({ index: idx + 1, hand, isPlayer: false, opponentIndex: idx })
      }
    })

    if (activePlayers.length === 0) {
      setMessage('All players folded!')
      setTimeout(() => {
        nextRound()
      }, 3000)
      return
    }

    activePlayers.sort((a, b) => compareHands(b.hand, a.hand, communityCards))
    const winner = activePlayers[0]
    const winnerEval = evaluateHand(winner.hand, communityCards)

    if (winner.isPlayer) {
      setMessage(`Round ${currentRound}: You win with ${winnerEval.name} !(+${pot} chips)`)
      setPlayerChips(prev => prev + pot)
      addChatMessage('system', `You won round ${currentRound} with ${winnerEval.name} !`)
    } else {
      const winnerName = OPPONENT_PERSONALITIES[winner.opponentIndex].name
      setMessage(`Round ${currentRound}: ${winnerName} wins with ${winnerEval.name} !`)
      setOpponentChips(prev => {
        const newChips = [...prev]
        newChips[winner.opponentIndex] += pot
        return newChips
      })
      addChatMessage(winnerName, `I won with ${winnerEval.name} !`)
    }

    setTimeout(() => {
      nextRound()
    }, 4000)
  }

  const nextRound = () => {
    if (currentRound >= 5) {
      endGame()
    } else {
      setCurrentRound(prev => prev + 1)
      setPot(0)
      startRound()
    }
  }

  const endGame = () => {
    setGameState('gameEnd')
    const allChips = [playerChips, ...opponentChips]
    const maxChips = Math.max(...allChips)
    const playerWon = playerChips === maxChips && playerChips > opponentChips[0] &&
      playerChips > opponentChips[1] && playerChips > opponentChips[2]

    if (playerWon) {
      setMessage(`Game Over! You won with ${playerChips} chips!`)
      addChatMessage('system', `Congratulations! You won with ${playerChips} chips!`)
      setTimeout(() => {
        localStorage.setItem('hiveWon', 'true')
        onWin()
      }, 2000)
    } else {
      setMessage(`Game Over! You finished with ${playerChips} chips.Winner had ${maxChips} chips.`)
      addChatMessage('system', `Game over! Final scores are in.`)
    }
  }

  const tryAgain = () => {
    setGameState('menu')
    setCurrentRound(1)
    setMessage('')
    setChatMessages([])
  }

  const canPlayerAct = () => {
    return gameState === 'playing' && currentPlayer === 0 && !foldedPlayers[0] && !isOpponentThinking
  }

  return (
    <div className="poker-overlay">
      <div className="poker-container">
        <h1 className="poker-title">poker</h1>
        <p className="poker-subtitle">5 rounds • ai opponents • texas hold'em</p>
        {!import.meta.env.VITE_GEMINI_API_KEY && gameState === 'menu' && (
          <div className="api-warning">
            ⚠️ No API key detected - using fallback AI. Add VITE_GEMINI_API_KEY for real AI agents.
          </div>
        )}

        {showRules && (
          <div className="rules-modal">
            <div className="rules-content">
              <h2>how to play</h2>
              <div className="rules-text">
                <p><strong>objective:</strong> finish 5 rounds with the most chips</p>
                <p><strong>texas hold'em:</strong></p>
                <ul>
                  <li>everyone gets 2 hole cards</li>
                  <li>5 community cards are dealt in stages: Flop (3), Turn (1), River (1)</li>
                  <li>make the best 5-card hand using any combination</li>
                  <li>betting happens before flop and after each deal</li>
                </ul>
                <p><strong>chat:</strong> talk to opponents to bluff or get info!</p>
                <button className="poker-button" onClick={() => setShowRules(false)}>
                  got it
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'menu' && (
          <>
            <button className="poker-button" onClick={startGame}>
              start game
            </button>
            <button className="poker-button" onClick={() => setShowRules(true)} style={{ marginTop: '1rem' }}>
              rules
            </button>
          </>
        )}

        {gameState === 'playing' && (
          <div className="poker-game-layout">
            <div className="poker-game-main">
              <div className="poker-info">
                <div className="poker-round">round {currentRound}/5</div>
                <div className="poker-chips">your chips: {playerChips}</div>
                <div className="poker-pot">pot: {pot}</div>
                <div className="poker-bet">current bet: {currentBet}</div>
                {!import.meta.env.VITE_GEMINI_API_KEY && (
                  <div className="ai-status-fallback">⚠️ Fallback AI</div>
                )}
                {import.meta.env.VITE_GEMINI_API_KEY && (
                  <div className="ai-status-real">✅ Real AI</div>
                )}
              </div>

              {/* Community Cards */}
              <div className="community-cards-section">
                <div className="community-label">community cards</div>
                <div className="community-cards">
                  {communityCards.map((card, index) => (
                    <div key={index} className="card">
                      {card.value}{card.suit}
                    </div>
                  ))}
                  {[...Array(5 - communityCards.length)].map((_, i) => (
                    <div key={i} className="card card-placeholder"></div>
                  ))}
                </div>
              </div>

              <div className="opponents-section">
                {opponentHands.map((hand, index) => (
                  <div key={index} className="opponent-hand">
                    <div className="opponent-label">
                      {OPPONENT_PERSONALITIES[index].name}
                      <span className="chips-display">({opponentChips[index]})</span>
                      {foldedPlayers[index + 1] && <span className="folded-badge">folded</span>}
                      {thinkingAgent === OPPONENT_PERSONALITIES[index].name && (
                        <span className="thinking-badge">
                          {apiStatus || 'thinking...'}
                        </span>
                      )}
                    </div>
                    <div className="hand">
                      {showCards ? (
                        hand.map((card, cardIndex) => (
                          <div key={cardIndex} className="card">
                            {card.value}{card.suit}
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="card card-hidden">?</div>
                          <div className="card card-hidden">?</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="player-hand-section">
                <div className="hand-label">
                  your hand
                  {foldedPlayers[0] && <span className="folded-badge">folded</span>}
                </div>
                <div className="hand">
                  {playerHand.map((card, index) => (
                    <div key={index} className="card">
                      {card.value}{card.suit}
                    </div>
                  ))}
                </div>
                <div className="hand-eval">
                  {evaluateHand(playerHand, communityCards).name}
                </div>
              </div>

              {message && (
                <div className={`poker - message ${message.includes('win') ? 'win' : ''} `}>
                  {message}
                </div>
              )}

              <div className="poker-actions">
                {canPlayerAct() ? (
                  <>
                    <button className="poker-button" onClick={playerFold}>
                      fold
                    </button>
                    <button
                      className="poker-button"
                      onClick={playerCall}
                      disabled={currentBet > playerBetThisRound && playerChips < (currentBet - playerBetThisRound)}
                    >
                      {currentBet === playerBetThisRound ? 'check' : `call(${currentBet - playerBetThisRound})`}
                    </button>
                    <button
                      className="poker-button"
                      onClick={playerRaise}
                      disabled={playerChips < Math.max(currentBet * 2, 20) - playerBetThisRound}
                    >
                      raise ({Math.max(currentBet * 2, 20)})
                    </button>
                  </>
                ) : (
                  <div className="waiting-message">
                    {isOpponentThinking ? (
                      <>
                        {thinkingAgent ? `${thinkingAgent} is thinking...` : 'Opponent is thinking...'}
                        {apiStatus && <div className="api-status">{apiStatus}</div>}
                      </>
                    ) : (
                      'Waiting for next action...'
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="chat-panel">
              <div className="chat-header">chat</div>
              <div className="chat-messages">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat - bubble ${msg.isPlayer ? 'player' : msg.speaker === 'system' ? 'system' : 'opponent'} `}>
                    <div className="chat-speaker">{msg.speaker === 'You' ? 'You' : msg.speaker}</div>
                    <div className="chat-text">{msg.text}</div>
                  </div>
                ))}
                {isOpponentThinking && thinkingAgent && (
                  <div className="chat-bubble opponent thinking">
                    <div className="chat-speaker">{thinkingAgent}</div>
                    <div className="chat-text">{apiStatus || 'thinking...'}</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="chat-input-container">
                <input
                  type="text"
                  className="chat-input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePlayerChat()}
                  placeholder="say something..."
                  disabled={isOpponentThinking}
                />
                <button
                  className="chat-send-button"
                  onClick={handlePlayerChat}
                  disabled={!chatInput.trim() || isOpponentThinking}
                >
                  send
                </button>
              </div>
            </div>
          </div>
        )}

        {gameState === 'gameEnd' && (
          <>
            <div className="final-scores">
              <h2>final scores</h2>
              <div className="score-entry">
                <span>you:</span>
                <span className={playerChips === Math.max(playerChips, ...opponentChips) ? 'winner' : ''}>
                  {playerChips} chips
                </span>
              </div>
              {opponentChips.map((chips, idx) => (
                <div key={idx} className="score-entry">
                  <span>{OPPONENT_PERSONALITIES[idx].name}:</span>
                  <span className={chips === Math.max(playerChips, ...opponentChips) ? 'winner' : ''}>
                    {chips} chips
                  </span>
                </div>
              ))}
            </div>
            {message && (
              <div className={`poker - message ${message.includes('won') ? 'win' : ''} `}>
                {message}
              </div>
            )}
            <button className="poker-button" onClick={tryAgain}>
              play again
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Poker
