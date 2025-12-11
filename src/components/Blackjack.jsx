import { useState, useEffect } from 'react'
import './Blackjack.css'

function Blackjack({ onWin }) {
  const [deck, setDeck] = useState([])
  const [playerHand, setPlayerHand] = useState([])
  const [dealerHand, setDealerHand] = useState([])
  const [playerScore, setPlayerScore] = useState(0)
  const [dealerScore, setDealerScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState('')
  const [gameStarted, setGameStarted] = useState(false)

  const suits = ['♠', '♥', '♦', '♣']
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

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
    if (card.value === 'A') return 11
    if (['J', 'Q', 'K'].includes(card.value)) return 10
    return parseInt(card.value)
  }

  const calculateScore = (hand) => {
    let score = 0
    let aces = 0

    for (let card of hand) {
      if (card.value === 'A') {
        aces++
        score += 11
      } else {
        score += getCardValue(card)
      }
    }

    while (score > 21 && aces > 0) {
      score -= 10
      aces--
    }

    return score
  }

  const startGame = () => {
    const newDeck = createDeck()
    const player = [newDeck.pop(), newDeck.pop()]
    const dealer = [newDeck.pop(), newDeck.pop()]

    setDeck(newDeck)
    setPlayerHand(player)
    setDealerHand(dealer)
    setPlayerScore(calculateScore(player))
    setDealerScore(calculateScore([dealer[0]]))
    setGameOver(false)
    setMessage('')
    setGameStarted(true)
  }

  const hit = () => {
    if (gameOver) return

    if (deck.length === 0) {
      const newDeck = createDeck()
      setDeck(newDeck)
    }

    const newCard = deck.pop()
    const newHand = [...playerHand, newCard]
    const newScore = calculateScore(newHand)

    setPlayerHand(newHand)
    setPlayerScore(newScore)
    setDeck([...deck])

    if (newScore > 21) {
      setGameOver(true)
      setMessage('bust. try again.')
    } else if (newScore === 21) {
      setGameOver(true)
      setMessage('blackjack! you win!')
      setTimeout(() => {
        localStorage.setItem('blackjackWon', 'true')
        onWin()
      }, 1500)
    }
  }

  const stand = () => {
    if (gameOver) return

    let newDeck = [...deck]
    let newDealerHand = [...dealerHand]
    let newDealerScore = calculateScore(newDealerHand)

    while (newDealerScore < 17) {
      const newCard = newDeck.pop()
      if (!newCard) break
      newDealerHand.push(newCard)
      newDealerScore = calculateScore(newDealerHand)
    }

    setDealerHand(newDealerHand)
    setDealerScore(newDealerScore)
    setGameOver(true)

    if (newDealerScore > 21) {
      setMessage('dealer bust. you win!')
      setTimeout(() => {
        localStorage.setItem('blackjackWon', 'true')
        onWin()
      }, 1500)
    } else if (newDealerScore > playerScore) {
      setMessage('dealer wins. try again.')
    } else if (newDealerScore < playerScore) {
      setMessage('you win!')
      setTimeout(() => {
        localStorage.setItem('blackjackWon', 'true')
        onWin()
      }, 1500)
    } else {
      setMessage('push. try again.')
    }
  }

  const tryAgain = () => {
    const newDeck = createDeck()
    const player = [newDeck.pop(), newDeck.pop()]
    const dealer = [newDeck.pop(), newDeck.pop()]

    setDeck(newDeck)
    setPlayerHand(player)
    setDealerHand(dealer)
    setPlayerScore(calculateScore(player))
    setDealerScore(calculateScore([dealer[0]]))
    setGameOver(false)
    setMessage('')
  }

  return (
    <div className="blackjack-overlay">
      <div className="blackjack-container">
        <h1 className="blackjack-title">blackjack</h1>
        <p className="blackjack-subtitle">win once to enter</p>

        {!gameStarted ? (
          <button className="blackjack-button" onClick={startGame}>
            start game
          </button>
        ) : (
          <>
            <div className="blackjack-game">
              <div className="hand-section">
                <div className="hand-label">dealer</div>
                <div className="hand">
                  {dealerHand.map((card, index) => (
                    <div
                      key={index}
                      className={`card ${index === 1 && !gameOver ? 'card-hidden' : ''}`}
                    >
                      {index === 1 && !gameOver ? '?' : `${card.value}${card.suit}`}
                    </div>
                  ))}
                </div>
                <div className="score">{gameOver ? dealerScore : `?`}</div>
              </div>

              <div className="hand-section">
                <div className="hand-label">you</div>
                <div className="hand">
                  {playerHand.map((card, index) => (
                    <div key={index} className="card">
                      {card.value}{card.suit}
                    </div>
                  ))}
                </div>
                <div className="score">{playerScore}</div>
              </div>
            </div>

            {message && (
              <div className={`blackjack-message ${message.includes('win') ? 'win' : ''}`}>
                {message}
              </div>
            )}

            <div className="blackjack-actions">
              {!gameOver ? (
                <>
                  <button
                    className="blackjack-button"
                    onClick={hit}
                    disabled={playerScore >= 21}
                  >
                    hit
                  </button>
                  <button
                    className="blackjack-button"
                    onClick={stand}
                  >
                    stand
                  </button>
                </>
              ) : (
                <button
                  className="blackjack-button"
                  onClick={tryAgain}
                >
                  try again
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Blackjack

