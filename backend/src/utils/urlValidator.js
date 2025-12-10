/**
 * Validates and normalizes URLs
 */
export function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return {
      valid: false,
      error: 'URL ist erforderlich'
    };
  }

  // Remove whitespace
  url = url.trim();

  // Add protocol if missing
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }

  try {
    const urlObj = new URL(url);

    // Check if it's http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        valid: false,
        error: 'Nur HTTP und HTTPS URLs sind erlaubt'
      };
    }

    // Check if hostname exists
    if (!urlObj.hostname || urlObj.hostname.length < 3) {
      return {
        valid: false,
        error: 'Ungültige Domain'
      };
    }

    return {
      valid: true,
      normalizedUrl: urlObj.href
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Ungültiges URL-Format'
    };
  }
}

/**
 * Checks if URL is from a known fake news domain
 */
export const FAKE_NEWS_BLACKLIST = [
  'compact-online.de',
  'anonymousnews.org',
  'pi-news.net',
  'journalistenwatch.com',
  'wochenblick.at'
];

/**
 * Trusted news sources
 */
export const TRUSTED_SOURCES = [
  'tagesschau.de',
  'zdf.de',
  'spiegel.de',
  'zeit.de',
  'sueddeutsche.de',
  'faz.net',
  'bbc.com',
  'reuters.com',
  'apnews.com',
  'nature.com',
  'science.org',
  'pubmed.ncbi.nlm.nih.gov',
  'destatis.de',
  'ec.europa.eu'
];

export function checkDomainReputation(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (FAKE_NEWS_BLACKLIST.some(domain => hostname.includes(domain))) {
      return { type: 'blacklisted', severity: 'high' };
    }

    if (TRUSTED_SOURCES.some(domain => hostname.includes(domain))) {
      return { type: 'trusted', severity: 'none' };
    }

    return { type: 'unknown', severity: 'medium' };
  } catch {
    return { type: 'unknown', severity: 'medium' };
  }
}
