import './SourcesList.css';

function SourcesList({ sources }) {
  if (!sources || sources.length === 0) {
    return (
      <div className="sources-list card">
        <h3>📚 Gefundene Quellen</h3>
        <p className="no-sources">Keine Quellen gefunden oder identifiziert.</p>
      </div>
    );
  }

  return (
    <div className="sources-list card">
      <h3>📚 Gefundene Quellen ({sources.length})</h3>

      <div className="sources-grid">
        {sources.map((source, index) => (
          <div
            key={index}
            className={`source-item ${source.trustworthy ? 'trustworthy' : 'untrusted'}`}
          >
            <div className="source-header">
              <span className="source-icon">{source.icon}</span>
              <span className="source-type">{source.typeLabel}</span>
              {source.trustworthy ? (
                <span className="trust-badge trusted">✓ Vertrauenswürdig</span>
              ) : (
                <span className="trust-badge untrusted">! Prüfen</span>
              )}
            </div>

            <h4 className="source-title">{source.title}</h4>

            <div className="source-footer">
              {source.date && (
                <span className="source-date">
                  📅 {new Date(source.date).toLocaleDateString('de-DE')}
                </span>
              )}
              {source.domain && (
                <span className="source-domain">{source.domain}</span>
              )}
            </div>

            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-link"
            >
              Quelle öffnen →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SourcesList;
