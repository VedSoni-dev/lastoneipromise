import { useState } from 'react'
import './MediaGallery.css'

function MediaGallery({ media = [] }) {
  const [selectedMedia, setSelectedMedia] = useState(null)

  if (!media || media.length === 0) {
    return null
  }

  const openModal = (item, index) => {
    setSelectedMedia({ ...item, index })
  }

  const closeModal = () => {
    setSelectedMedia(null)
  }

  const navigateMedia = (direction) => {
    if (!selectedMedia) return
    const currentIndex = selectedMedia.index
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % media.length
      : (currentIndex - 1 + media.length) % media.length
    setSelectedMedia({ ...media[newIndex], index: newIndex })
  }

  return (
    <>
      <div className="media-gallery">
        {media.map((item, index) => (
          <div 
            key={index} 
            className="media-item"
            onClick={() => openModal(item, index)}
          >
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt={item.alt || `Media ${index + 1}`}
                loading="lazy"
              />
            ) : item.type === 'video' ? (
              <div className="video-thumbnail">
                {item.thumbnail ? (
                  <img 
                    src={item.thumbnail} 
                    alt={item.alt || `Video thumbnail ${index + 1}`}
                    loading="lazy"
                  />
                ) : (
                  <video src={item.url} muted />
                )}
                <div className="play-overlay">▶</div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {selectedMedia && (
        <div className="media-modal-overlay" onClick={closeModal}>
          <div className="media-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="media-modal-close"
              onClick={closeModal}
              aria-label="Close media viewer"
            >
              ×
            </button>
            {media.length > 1 && (
              <>
                <button 
                  className="media-modal-nav media-modal-prev"
                  onClick={() => navigateMedia('prev')}
                  aria-label="Previous media"
                >
                  ‹
                </button>
                <button 
                  className="media-modal-nav media-modal-next"
                  onClick={() => navigateMedia('next')}
                  aria-label="Next media"
                >
                  ›
                </button>
              </>
            )}
            <div className="media-modal-content">
              {selectedMedia.type === 'image' ? (
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.alt || 'Media'}
                />
              ) : selectedMedia.type === 'video' ? (
                <video 
                  src={selectedMedia.url} 
                  controls 
                  autoPlay
                />
              ) : null}
            </div>
            {selectedMedia.alt && (
              <p className="media-modal-caption">{selectedMedia.alt}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default MediaGallery

