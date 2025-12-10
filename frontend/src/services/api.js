import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Analyzes a URL using the backend API
 */
export async function analyzeURL(url) {
  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, {
      url
    }, {
      timeout: 60000, // 60 seconds timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Analyse fehlgeschlagen');
    }

    return response.data;

  } catch (error) {
    // Handle different error types
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || error.response.data?.error;
      throw new Error(message || 'Server-Fehler bei der Analyse');
    } else if (error.request) {
      // Request was made but no response
      throw new Error('Keine Verbindung zum Server. Bitte prüfen Sie, ob das Backend läuft.');
    } else {
      // Something else happened
      throw new Error(error.message || 'Unbekannter Fehler bei der Analyse');
    }
  }
}
