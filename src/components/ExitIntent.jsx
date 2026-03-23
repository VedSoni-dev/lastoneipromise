import { useState, useEffect, useRef } from 'react'
import './ExitIntent.css'

export default function ExitIntent({ engagement, alreadySubscribed }) {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const dismissed = useRef(false)
  const triggered = useRef(false)

  useEffect(() => {
    if (alreadySubscribed) return

    // Desktop: mouse leaves toward top of viewport
    const handleMouseLeave = (e) => {
      if (e.clientY <= 5 && !triggered.current && !dismissed.current) {
        triggered.current = true
        setShow(true)
      }
    }

    // Mobile: detect page visibility change (switching tabs)
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && !triggered.current && !dismissed.current) {
        triggered.current = true
        // Show when they come back
        const onReturn = () => {
          if (document.visibilityState === 'visible') {
            setShow(true)
            document.removeEventListener('visibilitychange', onReturn)
          }
        }
        document.addEventListener('visibilitychange', onReturn)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [alreadySubscribed])

  const handleDismiss = () => {
    dismissed.current = true
    setShow(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || status === 'sending' || status === 'done') return

    setStatus('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          engagement: {
            sectionsViewed: engagement.sectionsViewed,
            maxScrollDepth: engagement.maxScrollDepth,
            timeOnPage: Math.round((Date.now() - engagement.startTime) / 1000),
            visitedAt: new Date().toISOString(),
          }
        })
      })

      if (res.ok) {
        setStatus('done')
        setTimeout(() => setShow(false), 2000)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (!show) return null

  return (
    <div className="exit-overlay" onClick={handleDismiss}>
      <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="exit-close" onClick={handleDismiss} aria-label="Close">&times;</button>

        {status === 'done' ? (
          <p className="exit-done">noted. you'll see.</p>
        ) : (
          <>
            <p className="exit-heading">before you leave</p>
            <p className="exit-body">
              drop your email and i'll predict exactly when you'll forget what you just saw.
            </p>
            <form className="exit-form" onSubmit={handleSubmit}>
              <input
                type="email"
                className="exit-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                disabled={status === 'sending'}
              />
              <button
                type="submit"
                className="exit-submit"
                disabled={status === 'sending' || !email}
              >
                {status === 'sending' ? '...' : 'try me'}
              </button>
            </form>
            {status === 'error' && (
              <p className="exit-error">something broke. try again.</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
