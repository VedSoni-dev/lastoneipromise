import { useState } from 'react'
import './CopyLink.css'

const PERSONA_URL = 'https://vedantsoni.com/vedant.md'

function CopyLink() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PERSONA_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = PERSONA_URL
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <div className="copy-link-bar" role="banner">
      <button
        type="button"
        className={`copy-link-btn${copied ? ' copied' : ''}`}
        onClick={handleCopy}
        aria-label="Copy persona link to clipboard"
      >
        <span className="copy-link-label">
          {copied ? 'copied — paste into your ai' : 'copy link → talk to ai as me'}
        </span>
        <span className="copy-link-url" aria-hidden="true">{PERSONA_URL}</span>
      </button>
    </div>
  )
}

export default CopyLink
