import './AbstractGraphic.css'

export default function AbstractGraphic() {
  return (
    <div className="abstract-graphic" aria-hidden="true">
      <div className="graphic-stack">
        <span className="tile tile-back" />
        <span className="tile tile-mid" />
        <span className="tile tile-front" />
        <span className="tile tile-accent" />
      </div>
    </div>
  )
}
