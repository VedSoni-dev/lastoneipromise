import { useState } from 'react'
import './EmailCapture.css'

export default function EmailCapture({ engagement, onSubscribed }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, sending, done, error

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
        onSubscribed?.()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="email-capture">
        <p className="email-capture-done">noted. check your inbox soon.</p>
      </div>
    )
  }

  return (
    <form className="email-capture" onSubmit={handleSubmit}>
      <p className="email-capture-cta">leave your email. trust me.</p>
      <div className="email-capture-row">
        <input
          type="email"
          className="email-capture-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={status === 'sending'}
        />
        <button
          type="submit"
          className="email-capture-submit"
          disabled={status === 'sending' || !email}
        >
          {status === 'sending' ? '...' : 'go'}
        </button>
      </div>
      {status === 'error' && (
        <p className="email-capture-error">something broke. try again.</p>
      )}
    </form>
  )
}
