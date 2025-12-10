import TrafficLight from './TrafficLight';
import SourcesList from './SourcesList';
import ShareButton from './ShareButton';
import './ResultDisplay.css';

function ResultDisplay({ result }) {
  const { url, analysis } = result;

  return (
    <div className="result-container">
      {/* Traffic Light - Main Rating */}
      <TrafficLight
        rating={analysis.rating}
        ratingColor={analysis.ratingColor}
        ratingLabel={analysis.ratingLabel}
      />

      {/* URL Info */}
      <div className="url-info card">
        <h3>Analysierte URL:</h3>
        <a href={url} target="_blank" rel="noopener noreferrer" className="analyzed-url">
          {url}
        </a>
        <ShareButton url={url} rating={analysis.rating} />
      </div>

      {/* Justification */}
      <div className="justification card">
        <h3>📋 Begründung</h3>
        <p>{analysis.justification}</p>
      </div>

      {/* Summary */}
      <div className="summary card">
        <h3>📄 Inhaltszusammenfassung</h3>
        <p>{analysis.summary}</p>
      </div>

      {/* Metadata */}
      <div className="metadata card">
        <h3>ℹ️ Metadaten</h3>
        <div className="metadata-grid">
          {analysis.metadata.author && (
            <div className="metadata-item">
              <strong>Autor:</strong>
              <span>{analysis.metadata.author}</span>
            </div>
          )}
          {analysis.metadata.publishDate && (
            <div className="metadata-item">
              <strong>Veröffentlicht:</strong>
              <span>{new Date(analysis.metadata.publishDate).toLocaleDateString('de-DE')}</span>
            </div>
          )}
          <div className="metadata-item">
            <strong>Wortanzahl:</strong>
            <span>{analysis.metadata.wordCount}</span>
          </div>
          <div className="metadata-item">
            <strong>Quellen gefunden:</strong>
            <span>{analysis.metadata.sourceCount}</span>
          </div>
          <div className="metadata-item">
            <strong>Domain-Reputation:</strong>
            <span className={`domain-badge ${analysis.metadata.domainReputation}`}>
              {analysis.metadata.domainReputation === 'trusted' && '✅ Vertrauenswürdig'}
              {analysis.metadata.domainReputation === 'unknown' && '❓ Unbekannt'}
              {analysis.metadata.domainReputation === 'blacklisted' && '❌ Blacklist'}
            </span>
          </div>
          <div className="metadata-item">
            <strong>KI-Content Verdacht:</strong>
            <span className={`ai-badge ${analysis.aiContentSuspicion}`}>
              {analysis.aiContentSuspicion === 'niedrig' && '🟢 Niedrig'}
              {analysis.aiContentSuspicion === 'mittel' && '🟡 Mittel'}
              {analysis.aiContentSuspicion === 'hoch' && '🔴 Hoch'}
            </span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {analysis.warnings && analysis.warnings.length > 0 && (
        <div className="warnings card">
          <h3>⚠️ Warnsignale</h3>
          <ul>
            {analysis.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      <SourcesList sources={analysis.sources} />
    </div>
  );
}

export default ResultDisplay;
