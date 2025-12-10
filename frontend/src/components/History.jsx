import './History.css';

function History({ history, onHistoryClick }) {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="history card">
      <h3>📜 Verlauf (letzte {history.length})</h3>

      <div className="history-list">
        {history.map((item, index) => (
          <button
            key={index}
            className="history-item"
            onClick={() => onHistoryClick(item.url)}
          >
            <div
              className="history-indicator"
              style={{ backgroundColor: item.ratingColor }}
            ></div>
            <div className="history-content">
              <div className="history-url">{item.url}</div>
              <div className="history-meta">
                <span className="history-rating">{item.rating}</span>
                <span className="history-time">
                  {new Date(item.timestamp).toLocaleString('de-DE')}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default History;
