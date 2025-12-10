import './ExampleURLs.css';

const EXAMPLE_URLS = [
  {
    label: 'Tagesschau (seriös)',
    url: 'https://www.tagesschau.de',
    description: 'Etabliertes deutsches Nachrichtenportal'
  },
  {
    label: 'Wikipedia (neutral)',
    url: 'https://de.wikipedia.org/wiki/Fake_News',
    description: 'Enzyklopädie-Artikel über Fake News'
  },
  {
    label: 'Zeit Online (seriös)',
    url: 'https://www.zeit.de',
    description: 'Qualitätsjournalismus'
  }
];

function ExampleURLs({ onExampleClick }) {
  return (
    <div className="example-urls card">
      <h3>🧪 Beispiel-URLs zum Testen</h3>
      <p className="example-description">
        Probieren Sie die Analyse mit diesen Beispiel-URLs aus:
      </p>

      <div className="example-list">
        {EXAMPLE_URLS.map((example, index) => (
          <button
            key={index}
            className="example-item"
            onClick={() => onExampleClick(example.url)}
          >
            <div className="example-label">{example.label}</div>
            <div className="example-url">{example.url}</div>
            <div className="example-desc">{example.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ExampleURLs;
