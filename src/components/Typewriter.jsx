import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const Typewriter = ({
  text,
  speed = 50,
  initialDelay = 0,
  waitTime = 2000,
  deleteSpeed = 30,
  loop = true,
  className = '',
  showCursor = true,
  hideCursorOnType = false,
  cursorChar = '|',
  cursorClassName = '',
  onTextChange,
}) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  const texts = Array.isArray(text) ? text : [text]

  useEffect(() => {
    let timeout

    const currentText = texts[currentTextIndex]

    const startTyping = () => {
      if (isDeleting) {
        if (displayText === '') {
          setIsDeleting(false)
          if (currentTextIndex === texts.length - 1 && !loop) return
          const nextIndex = (currentTextIndex + 1) % texts.length
          setCurrentTextIndex(nextIndex)
          setCurrentIndex(0)
          onTextChange?.(nextIndex)
          timeout = setTimeout(() => {}, waitTime)
        } else {
          timeout = setTimeout(() => {
            setDisplayText(prev => prev.slice(0, -1))
          }, deleteSpeed)
        }
      } else {
        if (currentIndex < currentText.length) {
          timeout = setTimeout(() => {
            setDisplayText(prev => prev + currentText[currentIndex])
            setCurrentIndex(prev => prev + 1)
          }, speed)
        } else if (texts.length > 1) {
          timeout = setTimeout(() => {
            setIsDeleting(true)
          }, waitTime)
        }
      }
    }

    if (currentIndex === 0 && !isDeleting && displayText === '') {
      timeout = setTimeout(startTyping, initialDelay)
    } else {
      startTyping()
    }

    return () => clearTimeout(timeout)
  }, [currentIndex, displayText, isDeleting, speed, deleteSpeed, waitTime, texts, currentTextIndex, loop])

  return (
    <span className={`typewriter ${className}`}>
      <span>{displayText}</span>
      {showCursor && (
        <motion.span
          className={`typewriter-cursor ${cursorClassName} ${
            hideCursorOnType && (currentIndex < texts[currentTextIndex].length || isDeleting) ? 'typewriter-cursor-hidden' : ''
          }`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              duration: 0.01,
              repeat: Infinity,
              repeatDelay: 0.4,
              repeatType: 'reverse',
            },
          }}
        >
          {cursorChar}
        </motion.span>
      )}
    </span>
  )
}

export default Typewriter
