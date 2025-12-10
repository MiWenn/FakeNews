const HISTORY_KEY = 'fakenews_analyzer_history';
const MAX_HISTORY_ITEMS = 10;

/**
 * Get analysis history from localStorage
 */
export function getHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * Save an analysis result to history
 */
export function saveToHistory(item) {
  try {
    const history = getHistory();

    // Remove duplicate URLs
    const filtered = history.filter(h => h.url !== item.url);

    // Add new item to beginning
    filtered.unshift(item);

    // Limit to MAX_HISTORY_ITEMS
    const limited = filtered.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(limited));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
}

/**
 * Clear all history
 */
export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}
