/**
 * Classifies and enriches source information
 */

const SOURCE_TYPE_ICONS = {
  wissenschaftlich: '🔬',
  medien: '📰',
  statistik: '📊',
  experte: '👤',
  social_media: '💬',
  keine: '❓'
};

const SOURCE_TYPE_LABELS = {
  wissenschaftlich: 'Wissenschaftliche Publikation',
  medien: 'Nachrichtenmedium',
  statistik: 'Offizielle Statistik',
  experte: 'Experteninterview',
  social_media: 'Social Media / Blog',
  keine: 'Keine Quellenangabe'
};

const TRUSTED_DOMAINS = {
  // Wissenschaft
  'nature.com': 'wissenschaftlich',
  'science.org': 'wissenschaftlich',
  'sciencedirect.com': 'wissenschaftlich',
  'springer.com': 'wissenschaftlich',
  'pubmed.ncbi.nlm.nih.gov': 'wissenschaftlich',
  'ncbi.nlm.nih.gov': 'wissenschaftlich',
  'doi.org': 'wissenschaftlich',

  // Deutsche Medien
  'tagesschau.de': 'medien',
  'zdf.de': 'medien',
  'spiegel.de': 'medien',
  'zeit.de': 'medien',
  'sueddeutsche.de': 'medien',
  'faz.net': 'medien',
  'welt.de': 'medien',
  'tagesspiegel.de': 'medien',
  'handelsblatt.com': 'medien',

  // International
  'bbc.com': 'medien',
  'reuters.com': 'medien',
  'apnews.com': 'medien',
  'nytimes.com': 'medien',
  'theguardian.com': 'medien',

  // Statistik
  'destatis.de': 'statistik',
  'ec.europa.eu': 'statistik',
  'europa.eu': 'statistik',
  'who.int': 'statistik',
  'worldbank.org': 'statistik',
  'oecd.org': 'statistik',
  'bundesbank.de': 'statistik'
};

/**
 * Classifies sources and adds metadata
 */
export function classifySources(sources) {
  if (!sources || !Array.isArray(sources)) {
    return [];
  }

  return sources.map(source => {
    const type = source.type || 'keine';
    const domain = extractDomain(source.url);

    // Override type based on known domains
    const knownType = TRUSTED_DOMAINS[domain];
    const finalType = knownType || type;

    // Determine trustworthiness
    const trustworthy = determineTrustworthiness(finalType, domain, source);

    return {
      title: source.title || 'Unbekannte Quelle',
      url: source.url || '#',
      type: finalType,
      typeLabel: SOURCE_TYPE_LABELS[finalType] || 'Unbekannt',
      icon: SOURCE_TYPE_ICONS[finalType] || '❓',
      date: source.date || null,
      trustworthy,
      domain
    };
  });
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '').toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Determine if source is trustworthy
 */
function determineTrustworthiness(type, domain, source) {
  // Known trusted domains
  if (TRUSTED_DOMAINS[domain]) {
    return true;
  }

  // Scientific sources with DOI
  if (type === 'wissenschaftlich' && (source.url?.includes('doi.org') || source.url?.includes('pubmed'))) {
    return true;
  }

  // Official statistics
  if (type === 'statistik') {
    return domain.includes('.gov') || domain.includes('.eu') || domain.includes('.int');
  }

  // Established media
  if (type === 'medien') {
    // Check if domain is known media
    const knownMedia = [
      'tagesschau', 'zdf', 'ard', 'spiegel', 'zeit', 'faz', 'sueddeutsche',
      'bbc', 'reuters', 'ap', 'guardian', 'nytimes'
    ];
    return knownMedia.some(media => domain.includes(media));
  }

  // Social media and blogs are generally not trustworthy as sources
  if (type === 'social_media') {
    return false;
  }

  // Default: unknown reliability
  return source.trustworthy !== undefined ? source.trustworthy : false;
}

/**
 * Analyze source distribution
 */
export function analyzeSourceDistribution(sources) {
  const distribution = {
    wissenschaftlich: 0,
    medien: 0,
    statistik: 0,
    experte: 0,
    social_media: 0,
    keine: 0
  };

  sources.forEach(source => {
    if (distribution[source.type] !== undefined) {
      distribution[source.type]++;
    }
  });

  const totalTrustworthy = sources.filter(s => s.trustworthy).length;
  const totalSources = sources.length;

  return {
    distribution,
    trustworthyRatio: totalSources > 0 ? totalTrustworthy / totalSources : 0,
    totalSources,
    totalTrustworthy
  };
}
