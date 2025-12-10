import { useState } from 'react';
import Header from './components/Header';
import URLInput from './components/URLInput';
import LoadingSpinner from './components/LoadingSpinner';
import ResultDisplay from './components/ResultDisplay';
import ExampleURLs from './components/ExampleURLs';
import History from './components/History';
import { analyzeURL } from './services/api';
import { saveToHistory, getHistory } from './utils/storage';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(getHistory());

  const handleAnalyze = async (urlToAnalyze) => {
    if (!urlToAnalyze || !urlToAnalyze.trim()) {
      setError('Bitte geben Sie eine gültige URL ein');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setUrl(urlToAnalyze);

    try {
      const data = await analyzeURL(urlToAnalyze);
      setResult(data);

      // Save to history
      const historyItem = {
        url: urlToAnalyze,
        rating: data.analysis.rating,
        ratingColor: data.analysis.ratingColor,
        timestamp: new Date().toISOString()
      };
      saveToHistory(historyItem);
      setHistory(getHistory());

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Analyse fehlgeschlagen. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleUrl) => {
    setUrl(exampleUrl);
    handleAnalyze(exampleUrl);
  };

  const handleHistoryClick = (historyUrl) => {
    setUrl(historyUrl);
    handleAnalyze(historyUrl);
  };

  return (
    <div className="app">
      <Header />

      <main className="container">
        <div className="main-content">
          <URLInput
            url={url}
            onUrlChange={setUrl}
            onAnalyze={() => handleAnalyze(url)}
            loading={loading}
          />

          {error && (
            <div className="error-message card">
              <h3>⚠️ Fehler</h3>
              <p>{error}</p>
            </div>
          )}

          {loading && <LoadingSpinner />}

          {result && !loading && (
            <ResultDisplay result={result} />
          )}

          {!loading && !result && (
            <>
              <ExampleURLs onExampleClick={handleExampleClick} />
              {history.length > 0 && (
                <History history={history} onHistoryClick={handleHistoryClick} />
              )}
            </>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>
            FakeNews Analyzer - Ein Tool zur Quellenprüfung und Fake-News-Erkennung
          </p>
          <p className="footer-note">
            Powered by Claude AI | Diese Analyse ersetzt keine manuelle Faktenprüfung
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
