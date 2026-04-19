import { useState } from 'react'
import personaText from '../persona/vedant.md?raw'
import './CopyLink.css'

function CopyLink() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(personaText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = personaText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const sizeKb = Math.max(1, Math.round(personaText.length / 1024))

  return (
    <div className="copy-link-bar" role="banner">
      <button
        type="button"
        className={`copy-link-btn${copied ? ' copied' : ''}`}
        onClick={handleCopy}
        aria-label="Copy persona prompt to clipboard"
      >
        <span className="copy-link-label">
          {copied ? 'copied — paste into your ai' : 'copy prompt → talk to ai as me'}
        </span>
        <span className="copy-link-url" aria-hidden="true">{`~${sizeKb}kb markdown`}</span>
      </button>
    </div>
  )
}

export default CopyLink
