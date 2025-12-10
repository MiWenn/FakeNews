import { useState } from 'react';
import './URLInput.css';

function URLInput({ url, onUrlChange, onAnalyze, loading }) {
  const [showInfo, setShowInfo] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!loading && url.trim()) {
      onAnalyze();
    }
  };

  return (
    <div className="url-input-section card">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            className="url-input"
            placeholder="https://example.com/artikel..."
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            disabled={loading}
            aria-label="URL eingeben"
          />
          <button
            type="submit"
            className="btn btn-primary analyze-btn"
            disabled={loading || !url.trim()}
          >
            {loading ? 'Analysiere...' : 'Analysieren'}
          </button>
        </div>
      </form>

      <button
        className="info-toggle"
        onClick={() => setShowInfo(!showInfo)}
        aria-label="Bewertungskriterien anzeigen"
      >
        {showInfo ? '▼' : '▶'} Bewertungskriterien
      </button>

      {showInfo && (
        <div className="info-panel">
          <h3>Wie wird bewertet?</h3>

          <div className="criteria">
            <div className="criterion">
              <span className="criterion-icon" style={{ color: 'var(--color-green)' }}>🟢</span>
              <div>
                <strong>GRÜN - Vertrauenswürdig</strong>
                <p>Mehrere seriöse Quellen, aktuelle Daten, transparente Herkunft, klare Fakten-Trennung</p>
              </div>
            </div>

            <div className="criterion">
              <span className="criterion-icon" style={{ color: 'var(--color-yellow)' }}>🟡</span>
              <div>
                <strong>GELB - Kritisch prüfen</strong>
                <p>Wenige/unklare Quellen, veraltete Daten, fehlende Transparenz, mögliche KI-Generierung</p>
              </div>
            </div>

            <div className="criterion">
              <span className="criterion-icon" style={{ color: 'var(--color-red)' }}>🔴</span>
              <div>
                <strong>ROT - Nicht vertrauenswürdig</strong>
                <p>Keine Quellen, widerlegte Behauptungen, bekannte Fake-News-Domain, reine Meinungsmache</p>
              </div>
            </div>
          </div>

          <div className="analyzed-aspects">
            <h4>Analysierte Aspekte:</h4>
            <ul>
              <li>📚 Quellenqualität und -anzahl</li>
              <li>🔬 Wissenschaftliche vs. anekdotische Belege</li>
              <li>📅 Aktualität der Daten</li>
              <li>🤖 KI-generierter Content (ohne Kennzeichnung)</li>
              <li>👤 Transparenz über Autor und Intention</li>
              <li>⚠️ Emotionale Manipulation und Reißer</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default URLInput;
