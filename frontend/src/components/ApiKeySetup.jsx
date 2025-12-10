import { useState } from 'react';
import { setApiKey, hasApiKey, getApiKey, clearApiKey } from '../services/api';
import './ApiKeySetup.css';

function ApiKeySetup({ onConfigured }) {
  const [apiKey, setApiKeyLocal] = useState('');
  const [showSetup, setShowSetup] = useState(!hasApiKey());
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!apiKey || apiKey.trim().length < 10) {
      setError('Bitte geben Sie einen gültigen API Key ein');
      return;
    }

    const success = setApiKey(apiKey);
    if (success) {
      setShowSetup(false);
      setError('');
      if (onConfigured) onConfigured();
    } else {
      setError('API Key konnte nicht gespeichert werden');
    }
  };

  const handleClear = () => {
    clearApiKey();
    setApiKeyLocal('');
    setShowSetup(true);
  };

  if (!showSetup && hasApiKey()) {
    return (
      <div className="api-key-status">
        <span className="status-indicator">✓ API Key konfiguriert</span>
        <button onClick={() => setShowSetup(true)} className="btn-link">
          Ändern
        </button>
      </div>
    );
  }

  return (
    <div className="api-key-setup card">
      <h3>🔑 Claude API Key erforderlich</h3>

      <div className="setup-info">
        <p>
          Diese Anwendung läuft komplett im Browser und benötigt Ihren eigenen Claude API Key.
        </p>
        <p>
          <strong>Wichtig:</strong> Der API Key wird nur in Ihrem Browser gespeichert (localStorage)
          und nie an einen Server gesendet.
        </p>
      </div>

      <div className="setup-steps">
        <h4>So erhalten Sie einen API Key:</h4>
        <ol>
          <li>
            Gehen Sie zu{' '}
            <a
              href="https://console.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-primary"
            >
              console.anthropic.com
            </a>
          </li>
          <li>Erstellen Sie einen Account oder loggen Sie sich ein</li>
          <li>Navigieren Sie zu "API Keys"</li>
          <li>Erstellen Sie einen neuen Key</li>
          <li>Kopieren Sie den Key und fügen Sie ihn unten ein</li>
        </ol>
      </div>

      <div className="input-group-vertical">
        <label htmlFor="api-key-input">Claude API Key:</label>
        <input
          id="api-key-input"
          type="password"
          className="api-key-input"
          placeholder="sk-ant-api03-..."
          value={apiKey}
          onChange={(e) => {
            setApiKeyLocal(e.target.value);
            setError('');
          }}
        />
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="button-group">
        <button onClick={handleSave} className="btn btn-primary">
          API Key speichern
        </button>
        {hasApiKey() && (
          <>
            <button onClick={() => setShowSetup(false)} className="btn btn-secondary">
              Abbrechen
            </button>
            <button onClick={handleClear} className="btn btn-secondary">
              Key löschen
            </button>
          </>
        )}
      </div>

      <div className="security-note">
        <h5>🔒 Sicherheitshinweis</h5>
        <p>
          Der API Key wird lokal in Ihrem Browser gespeichert. Wenn Sie diese Anwendung
          auf einem öffentlichen Computer nutzen, denken Sie daran, den Key wieder zu löschen.
        </p>
        <p>
          <strong>Für Production-Einsatz:</strong> Verwenden Sie ein Backend-System,
          um API Keys sicher zu verwalten.
        </p>
      </div>
    </div>
  );
}

export default ApiKeySetup;
