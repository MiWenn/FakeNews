import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="loading-container card">
      <div className="spinner"></div>
      <h3>Analyse läuft...</h3>
      <p className="loading-text">
        Die URL wird geprüft, Inhalte extrahiert und Quellen analysiert.
        <br />
        Dies kann 10-30 Sekunden dauern.
      </p>
      <div className="loading-steps">
        <div className="loading-step">
          <span className="step-icon">🔍</span>
          <span>Webseite abrufen</span>
        </div>
        <div className="loading-step">
          <span className="step-icon">📝</span>
          <span>Inhalt extrahieren</span>
        </div>
        <div className="loading-step">
          <span className="step-icon">🤖</span>
          <span>KI-Analyse durchführen</span>
        </div>
        <div className="loading-step">
          <span className="step-icon">✅</span>
          <span>Bewertung erstellen</span>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
