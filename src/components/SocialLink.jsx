function SocialLink({ social, onHiveClick, onBlackjackClick }) {
  if (social.action) {
    return (
      <button
        className="social-link"
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (social.action === 'hive') {
            onHiveClick()
          } else if (social.action === 'blackjack') {
            onBlackjackClick()
          }
        }}
      >
        {social.name}
      </button>
    )
  }

  return (
    <a
      href={social.url}
      className="social-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {social.name}
    </a>
  )
}

export default SocialLink


