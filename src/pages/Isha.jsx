import { useState } from 'react'
import Grainient from '../components/Grainient'
import './Isha.css'

const QUESTIONS = [
    {
        id: 1,
        question: "Tell me the name of my favorite show that we've watched together?",
        answers: ['saiki', 'saiki k', 'the disastrous life of saiki k'],
        flower: '🌸' // Cherry Blossom
    },
    {
        id: 2,
        question: "What did I wear on Halloween?",
        answers: ['fih', 'fih shirt', 'fih costume'],
        flower: '🌺' // Hibiscus
    },
    {
        id: 3,
        question: "What is my favorite color?",
        answers: ['black'],
        flower: '🌹' // Rose
    },
    {
        id: 4,
        question: "What web service does AWS provide?",
        answers: ['the cloud', 'cloud', 'cloud computing'],
        flower: '🌻' // Sunflower
    },
    {
        id: 5,
        question: "What is your favorite drink that you made for me?",
        answers: ['matcha', 'matcha latte', 'iced matcha'],
        flower: '🌷' // Tulip
    },
    {
        id: 6,
        question: "What is the name of the fake plant back in the day?",
        answers: ['bob'],
        flower: '🪷' // Lotus
    },
    {
        id: 7,
        question: "Where did we have our first date?",
        answers: ['cava'],
        flower: '🌼' // Blossom
    },
    {
        id: 8,
        question: "Who loves you more than anything?",
        answers: ['vedant', 'you', 'me'],
        flower: '💐' // Bouquet
    }
]

function Isha() {
    const [gameState, setGameState] = useState('welcome') // welcome, intro, playing, completed
    const [currentLevel, setCurrentLevel] = useState(0)
    const [inventory, setInventory] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [shake, setShake] = useState(false)
    const [showFlower, setShowFlower] = useState(false)

    const handleContinue = () => {
        setGameState('intro')
    }

    const handleStart = () => {
        setGameState('playing')
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const currentQ = QUESTIONS[currentLevel]
        const isCorrect = currentQ.answers.some(ans =>
            inputValue.toLowerCase().trim().includes(ans)
        )

        if (isCorrect) {
            // Show flower animation
            setShowFlower(true)

            setTimeout(() => {
                setInventory([...inventory, currentQ.flower])
                setShowFlower(false)
                setInputValue('')

                if (currentLevel + 1 >= QUESTIONS.length) {
                    setGameState('completed')
                } else {
                    setCurrentLevel(currentLevel + 1)
                }
            }, 2000)
        } else {
            setShake(true)
            setTimeout(() => setShake(false), 500)
        }
    }

    return (
        <div className="isha-page">
            <div className="grainient-bg">
                <Grainient
                    color1="#ffffff"
                    color2="#cb57b6"
                    color3="#be0404"
                    timeSpeed={0.65}
                    colorBalance={0}
                    warpStrength={1}
                    warpFrequency={5}
                    warpSpeed={2}
                    warpAmplitude={50}
                    blendAngle={0}
                    blendSoftness={0.05}
                    rotationAmount={500}
                    noiseScale={2}
                    grainAmount={0.1}
                    grainScale={2}
                    grainAnimated={false}
                    contrast={1.5}
                    gamma={1}
                    saturation={1}
                    centerX={0}
                    centerY={0}
                    zoom={0.9}
                />
            </div>

            {gameState === 'welcome' && (
                <div className="glass-box welcome-box">
                    <h1 className="valentine-text">Happy Valentine's Day!</h1>
                    <button className="start-btn" onClick={handleContinue} style={{ marginTop: '2rem' }}>
                        Continue
                    </button>
                </div>
            )}

            {gameState === 'intro' && (
                <div className="glass-box intro-box">
                    <h1 className="valentine-text">Hey Isha!</h1>
                    <p className="game-instruction">
                        This year you're going to have to work for your card by solving my puzzles and collecting flowers.
                        <br /><br />
                        There are 8 flowers to collect. Good luck!
                    </p>
                    <button className="start-btn" onClick={handleStart}>
                        Start Game
                    </button>
                </div>
            )}

            {gameState === 'playing' && (
                <div className={`glass-box game-box ${shake ? 'shake' : ''}`}>
                    <div className="progress-indicator">
                        Flower {currentLevel + 1} of {QUESTIONS.length}
                    </div>

                    {showFlower ? (
                        <div className="flower-reveal">
                            <span className="flower-emoji-large">{QUESTIONS[currentLevel].flower}</span>
                            <p className="correct-text">Correct!</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="question-text">{QUESTIONS[currentLevel].question}</h2>
                            <form onSubmit={handleSubmit} className="game-form">
                                <input
                                    type="text"
                                    className="game-input"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your answer..."
                                    autoFocus
                                />
                                <button type="submit" className="submit-btn">
                                    Submit
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}

            {gameState === 'completed' && (
                <div className="completed-container" style={{ display: 'flex', flexDirection: 'column', gap: '4rem', alignItems: 'center', margin: 'auto', padding: '2rem 1rem', width: '100%' }}>
                    <div className="glass-box completed-box">
                        <div className="bouquet-display">
                            <img
                                src="/bouquet.png"
                                alt="Valentine's Bouquet"
                                className="bouquet-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            {/* Fallback to emojis if image fails/is missing */}
                            <div className="bouquet-fallback" style={{ display: 'none', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {inventory.map((flower, i) => (
                                    <span key={i} className="flower-emoji" style={{ animationDelay: `${i * 0.1}s` }}>
                                        {flower}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <h1 className="valentine-text">
                            Happy Valentine's Day!
                        </h1>
                        <p className="love-note" style={{ marginBottom: '1rem' }}>
                            Scroll down for one last message... ↓
                        </p>
                    </div>

                    <div className="glass-box message-box" style={{ maxWidth: '800px', animation: 'slideInUp 1s ease 0.5s both' }}>
                        <h2 className="valentine-text" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>To My Hardest Worker</h2>
                        <p className="love-note" style={{ fontSize: '1.4rem', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                            I love you so much.
                            Happy Valentine's Day to the hardest worker I know.
                            Without you, I wouldn't have any motivation to make it through life.
                            I appreciate you so much and I'll never forget our almost 3 years together.
                        </p>
                    </div>
                </div>
            )}

            {/* Persistent Inventory Bar */}
            {gameState !== 'welcome' && gameState !== 'intro' && (
                <div className="inventory-bar">
                    {inventory.map((flower, i) => (
                        <span key={i} className="inventory-flower">
                            {flower}
                        </span>
                    ))}
                    {Array.from({ length: 8 - inventory.length }).map((_, i) => (
                        <span key={`empty-${i}`} className="inventory-slot">
                            •
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Isha
