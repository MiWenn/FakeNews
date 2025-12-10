import './ExampleURLs.css';

const EXAMPLE_URLS = [
  {
    label: 'BR.de Artikel (öffentlich-rechtlich)',
    url: 'https://www.br.de/nachrichten/bayern/eltern-machen-ausbildung-moeglich-so-geht-es-azubis-in-bayern,V4yFo8l',
    description: 'Bayerischer Rundfunk - Vertrauenswürdig'
  },
  {
    label: 'Wikipedia (neutral)',
    url: 'https://de.wikipedia.org/wiki/Fake_News',
    description: 'Enzyklopädie-Artikel über Fake News'
  },
  {
    label: 'Tagesschau Artikel (seriös)',
    url: 'https://www.tagesschau.de/inland/innenpolitik/index.html',
    description: 'ARD Nachrichtenportal'
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
