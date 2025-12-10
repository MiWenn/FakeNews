import './TrafficLight.css';

function TrafficLight({ rating, ratingColor, ratingLabel }) {
  return (
    <div className="traffic-light-container card">
      <h2>Bewertung</h2>

      <div className="traffic-light">
        <div className="traffic-light-lights">
          <div
            className={`light ${rating === 'GRÜN' ? 'active' : ''}`}
            style={{ backgroundColor: rating === 'GRÜN' ? 'var(--color-green)' : '#e5e7eb' }}
          >
            {rating === 'GRÜN' && <span className="light-icon">✓</span>}
          </div>
          <div
            className={`light ${rating === 'GELB' ? 'active' : ''}`}
            style={{ backgroundColor: rating === 'GELB' ? 'var(--color-yellow)' : '#e5e7eb' }}
          >
            {rating === 'GELB' && <span className="light-icon">!</span>}
          </div>
          <div
            className={`light ${rating === 'ROT' ? 'active' : ''}`}
            style={{ backgroundColor: rating === 'ROT' ? 'var(--color-red)' : '#e5e7eb' }}
          >
            {rating === 'ROT' && <span className="light-icon">✕</span>}
          </div>
        </div>

        <div className="traffic-light-label">
          <div
            className="rating-badge"
            style={{ backgroundColor: ratingColor, color: 'white' }}
          >
            {rating}
          </div>
          <h3 className="rating-text">{ratingLabel}</h3>
        </div>
      </div>

      <div className="rating-description">
        {rating === 'GRÜN' && (
          <p>
            ✅ Diese Quelle erscheint vertrauenswürdig und kann als Referenz verwendet werden.
            Trotzdem empfehlen wir, wichtige Informationen zu verifizieren.
          </p>
        )}
        {rating === 'GELB' && (
          <p>
            ⚠️ Diese Quelle sollte kritisch geprüft werden. Überprüfen Sie die Quellenangaben
            und gleichen Sie Informationen mit anderen vertrauenswürdigen Quellen ab.
          </p>
        )}
        {rating === 'ROT' && (
          <p>
            ❌ Diese Quelle ist nicht vertrauenswürdig. Informationen aus dieser Quelle
            sollten nicht als Fakten verwendet werden. Suchen Sie nach besseren Quellen.
          </p>
        )}
      </div>
    </div>
  );
}

export default TrafficLight;
