import { useCallback, useEffect, useRef, useState } from 'react'
import './RetroEmulator.css'

const COLS = 20
const ROWS = 20
const TICK_MS = 110

const PALETTE = {
  bg: '#0a1a0a',
  grid: '#142814',
  snake: '#8bac0f',
  head: '#9bbc0f',
  food: '#e8f060',
  dead: '#306230',
}

const START_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
]

function randomFood(snake) {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`))
  let spot
  do {
    spot = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
  } while (occupied.has(`${spot.x},${spot.y}`))
  return spot
}

function sameCell(a, b) {
  return a.x === b.x && a.y === b.y
}

export default function RetroEmulator() {
  const canvasRef = useRef(null)
  const dirRef = useRef({ x: 1, y: 0 })
  const foodRef = useRef(randomFood(START_SNAKE))
  const scoreRef = useRef(0)

  const [snake, setSnake] = useState(START_SNAKE)
  const [food, setFood] = useState(foodRef.current)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [status, setStatus] = useState('idle')
  const [paused, setPaused] = useState(false)

  const reset = useCallback(() => {
    const startFood = randomFood(START_SNAKE)
    foodRef.current = startFood
    dirRef.current = { x: 1, y: 0 }
    scoreRef.current = 0
    setSnake(START_SNAKE)
    setFood(startFood)
    setScore(0)
    setPaused(false)
    setStatus('playing')
  }, [])

  const queueDirection = useCallback((next) => {
    const cur = dirRef.current
    if (cur.x + next.x === 0 && cur.y + next.y === 0) return
    dirRef.current = next
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const key = e.key.toLowerCase()
      if (key === ' ' || key === 'enter') {
        e.preventDefault()
        if (status === 'idle' || status === 'dead') reset()
        else if (status === 'playing') setPaused((p) => !p)
        return
      }
      if (status !== 'playing' || paused) return
      if (key === 'arrowup' || key === 'w') queueDirection({ x: 0, y: -1 })
      if (key === 'arrowdown' || key === 's') queueDirection({ x: 0, y: 1 })
      if (key === 'arrowleft' || key === 'a') queueDirection({ x: -1, y: 0 })
      if (key === 'arrowright' || key === 'd') queueDirection({ x: 1, y: 0 })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, paused, reset, queueDirection])

  useEffect(() => {
    if (status !== 'playing' || paused) return undefined

    const id = setInterval(() => {
      setSnake((prev) => {
        const d = dirRef.current
        const head = { x: prev[0].x + d.x, y: prev[0].y + d.y }

        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
          setStatus('dead')
          setHighScore((h) => Math.max(h, scoreRef.current))
          return prev
        }

        if (prev.some((s) => sameCell(s, head))) {
          setStatus('dead')
          setHighScore((h) => Math.max(h, scoreRef.current))
          return prev
        }

        const next = [head, ...prev]
        if (sameCell(head, foodRef.current)) {
          const newFood = randomFood(next)
          foodRef.current = newFood
          setFood(newFood)
          scoreRef.current += 1
          setScore(scoreRef.current)
          return next
        }

        next.pop()
        return next
      })
    }, TICK_MS)

    return () => clearInterval(id)
  }, [status, paused])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    const cellW = w / COLS
    const cellH = h / ROWS

    ctx.fillStyle = PALETTE.bg
    ctx.fillRect(0, 0, w, h)

    for (let x = 0; x < COLS; x += 1) {
      for (let y = 0; y < ROWS; y += 1) {
        if ((x + y) % 2 === 0) {
          ctx.fillStyle = PALETTE.grid
          ctx.fillRect(x * cellW, y * cellH, cellW, cellH)
        }
      }
    }

    ctx.fillStyle = PALETTE.food
    ctx.fillRect(food.x * cellW + 2, food.y * cellH + 2, cellW - 4, cellH - 4)

    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0
        ? (status === 'dead' ? PALETTE.dead : PALETTE.head)
        : PALETTE.snake
      ctx.fillRect(seg.x * cellW + 1, seg.y * cellH + 1, cellW - 2, cellH - 2)
    })

    if (status === 'idle') {
      ctx.fillStyle = 'rgba(10, 26, 10, 0.72)'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = PALETTE.head
      ctx.font = '600 11px "Press Start 2P", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('WICK.OS', w / 2, h / 2 - 14)
      ctx.font = '400 8px "Press Start 2P", monospace'
      ctx.fillText('SPACE TO PLAY', w / 2, h / 2 + 10)
    }

    if (status === 'dead') {
      ctx.fillStyle = 'rgba(10, 26, 10, 0.8)'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = PALETTE.head
      ctx.font = '600 9px "Press Start 2P", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', w / 2, h / 2 - 8)
      ctx.font = '400 7px "Press Start 2P", monospace'
      ctx.fillText('SPACE TO RETRY', w / 2, h / 2 + 12)
    }

    if (paused) {
      ctx.fillStyle = 'rgba(10, 26, 10, 0.65)'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = PALETTE.head
      ctx.font = '600 9px "Press Start 2P", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('PAUSED', w / 2, h / 2)
    }
  }, [snake, food, status, paused])

  const handlePad = (direction) => {
    if (status === 'idle' || status === 'dead') {
      reset()
      return
    }
    queueDirection(direction)
  }

  return (
    <div className="retro-emulator" aria-label="Wick OS game emulator">
      <div className="retro-shell">
        <div className="retro-bezel">
          <div className="retro-screen-header">
            <span className="retro-label">WICK.OS</span>
            <span className="retro-score">SCORE {String(score).padStart(3, '0')}</span>
          </div>
          <canvas
            ref={canvasRef}
            className="retro-canvas"
            width={280}
            height={280}
            tabIndex={0}
            onClick={() => {
              if (status === 'idle' || status === 'dead') reset()
            }}
          />
          <div className="retro-screen-footer">
            <span>HI {String(highScore).padStart(3, '0')}</span>
            <span>WASD / ARROWS</span>
          </div>
        </div>

        <div className="retro-controls" aria-hidden="true">
          <button type="button" className="retro-btn up" onClick={() => handlePad({ x: 0, y: -1 })} aria-label="Up" />
          <button type="button" className="retro-btn left" onClick={() => handlePad({ x: -1, y: 0 })} aria-label="Left" />
          <button type="button" className="retro-btn right" onClick={() => handlePad({ x: 1, y: 0 })} aria-label="Right" />
          <button type="button" className="retro-btn down" onClick={() => handlePad({ x: 0, y: 1 })} aria-label="Down" />
        </div>
      </div>
    </div>
  )
}
