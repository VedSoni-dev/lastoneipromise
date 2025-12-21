import { useState, useEffect } from 'react'
import './Resume.css'

function Resume() {
  const [showModal, setShowModal] = useState(false)
  const [pdfError, setPdfError] = useState(false)
  const resumePdfPath = '/resume.pdf'
  
  useEffect(() => {
    // Check if PDF is accessible
    fetch(resumePdfPath, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          setPdfError(true)
        }
      })
      .catch(() => setPdfError(true))
  }, [])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = resumePdfPath
    link.download = 'Vedant_Soni_Resume.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleGoHome = () => {
    window.history.pushState({}, '', '/')
    window.dispatchEvent(new PopStateEvent('popstate'))
    setShowModal(false)
  }

  return (
    <div className="resume-page">
      <div className="resume-content">
        <button 
          className="resume-explore-link"
          onClick={() => setShowModal(true)}
        >
          you're already on my website, why not check the rest out
        </button>

        {showModal && (
          <div className="resume-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="resume-modal" onClick={(e) => e.stopPropagation()}>
              <button 
                className="resume-modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
              <p className="resume-modal-text">
                before u go, you wont find this resume page again. make sure to download the resume before you leave.
              </p>
              <div className="resume-modal-buttons">
                <button 
                  className="resume-modal-download"
                  onClick={handleDownload}
                >
                  📥 Download Resume
                </button>
                <button 
                  className="resume-modal-go-home"
                  onClick={handleGoHome}
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="resume-header">
          <h1 className="resume-title">Vedant Soni</h1>
          <div className="resume-contact">
            <p>ved.06.soni@gmail.com</p>
            <p>
              <a href="https://www.linkedin.com/in/vedantsonimech" target="_blank" rel="noopener noreferrer">LinkedIn</a> | 
              <a href="https://x.com/VedantRobot" target="_blank" rel="noopener noreferrer"> X</a> | 
              <a href="https://github.com/VedSoni-dev" target="_blank" rel="noopener noreferrer"> GitHub</a>
            </p>
          </div>
          <a 
            href={resumePdfPath} 
            download="Vedant_Soni_Resume.pdf"
            className="resume-download-button"
          >
            📥 Download PDF
          </a>
        </div>

        <div className="resume-pdf-container">
          {pdfError ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Unable to load PDF preview. Please use the download button above.</p>
            </div>
          ) : (
            <iframe
              src={`${resumePdfPath}#toolbar=0`}
              className="resume-pdf-viewer"
              title="Resume PDF"
              onLoad={(e) => {
                // Check if iframe loaded HTML instead of PDF
                try {
                  const iframe = e.target
                  if (iframe.contentDocument && iframe.contentDocument.body) {
                    const bodyText = iframe.contentDocument.body.innerText || ''
                    if (bodyText.includes('root') || bodyText.includes('React')) {
                      setPdfError(true)
                    }
                  }
                } catch (err) {
                  // Cross-origin or other error - assume it's working
                }
              }}
              onError={() => setPdfError(true)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default Resume

