import './NavigationArrows.css'

function NavigationArrows({ currentPage, onNavigate }) {
  return (
    <div className="navigation-arrows">
      {currentPage === 0 && (
        <>
          <button 
            className="nav-arrow nav-arrow-right" 
            onClick={() => onNavigate(2)}
            aria-label="Go to About"
          >
            <span className="arrow-icon">→</span>
            <span className="arrow-label">About</span>
          </button>
          <button 
            className="nav-arrow nav-arrow-down" 
            onClick={() => onNavigate(1)}
            aria-label="Go to Experience"
          >
            <span className="arrow-icon">↓</span>
            <span className="arrow-label">Experience</span>
          </button>
          <button 
            className="nav-arrow nav-arrow-up" 
            onClick={() => onNavigate(3)}
            aria-label="Go to Blog"
          >
            <span className="arrow-icon">↑</span>
            <span className="arrow-label">Blog</span>
          </button>
        </>
      )}
      
      {currentPage === 1 && (
        <button 
          className="nav-arrow nav-arrow-up" 
          onClick={() => onNavigate(0)}
          aria-label="Go to Home"
        >
          <span className="arrow-icon">↑</span>
          <span className="arrow-label">Home</span>
        </button>
      )}
      
      {currentPage === 2 && (
        <button 
          className="nav-arrow nav-arrow-left" 
          onClick={() => onNavigate(0)}
          aria-label="Go to Home"
        >
          <span className="arrow-icon">←</span>
          <span className="arrow-label">Home</span>
        </button>
      )}
      
      {currentPage === 3 && (
        <button 
          className="nav-arrow nav-arrow-down" 
          onClick={() => onNavigate(0)}
          aria-label="Go to Home"
        >
          <span className="arrow-icon">↓</span>
          <span className="arrow-label">Home</span>
        </button>
      )}
    </div>
  )
}

export default NavigationArrows

