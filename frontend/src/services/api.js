import Anthropic from '@anthropic-ai/sdk';

/**
 * WICHTIG: API Key Management
 * Der Claude API Key wird im Frontend gespeichert. Dies ist nur für Demo-Zwecke geeignet.
 * Für Production sollte ein Backend verwendet werden.
 */

let claudeClient = null;

export function setApiKey(apiKey) {
  if (apiKey && apiKey.trim()) {
    claudeClient = new Anthropic({
      apiKey: apiKey.trim(),
      dangerouslyAllowBrowser: true // Erlaubt Browser-Nutzung
    });
    // Save to localStorage
    localStorage.setItem('claude_api_key', apiKey.trim());
    return true;
  }
  return false;
}

export function getApiKey() {
  return localStorage.getItem('claude_api_key') || '';
}

export function hasApiKey() {
  return !!getApiKey();
}

export function clearApiKey() {
  localStorage.removeItem('claude_api_key');
  claudeClient = null;
}

/**
 * Initialize client from localStorage
 */
export function initializeClient() {
  const savedKey = getApiKey();
  if (savedKey) {
    setApiKey(savedKey);
    return true;
  }
  return false;
}

/**
 * Scrapes URL content using CORS proxy
 */
async function scrapeUrl(url) {
  try {
    // Use allOrigins as CORS proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Scraping fehlgeschlagen');
    }

    const data = await response.json();
    const html = data.contents;

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove unwanted elements
    const unwantedSelectors = 'script, style, nav, header, footer, aside, .ad, .advertisement';
    doc.querySelectorAll(unwantedSelectors).forEach(el => el.remove());

    // Extract title
    const title = doc.title || doc.querySelector('h1')?.textContent || '';

    // Extract main content
    const mainContent = doc.querySelector('article, main, .content, .post-content, .article-content, [role="main"]');
    const content = mainContent ? mainContent.textContent : doc.body.textContent;

    // Clean content
    const cleanContent = content.replace(/\s+/g, ' ').trim();

    // Extract metadata
    const author = doc.querySelector('meta[name="author"]')?.content ||
                   doc.querySelector('.author')?.textContent || '';

    const publishDate = doc.querySelector('meta[property="article:published_time"]')?.content ||
                       doc.querySelector('time')?.getAttribute('datetime') ||
                       '';

    // Extract links
    const links = Array.from(doc.querySelectorAll('a[href]'))
      .map(a => ({
        href: a.href,
        text: a.textContent.trim()
      }))
      .filter(link => link.href.startsWith('http') && link.text)
      .slice(0, 50);

    return {
      success: true,
      content: {
        title: title.trim(),
        content: cleanContent.substring(0, 15000),
        author: author.trim(),
        publishDate: publishDate.trim(),
        links,
        wordCount: cleanContent.split(/\s+/).length
      }
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Analyzes URL content with Claude AI
 */
export async function analyzeURL(url) {
  if (!claudeClient) {
    const initialized = initializeClient();
    if (!initialized) {
      throw new Error('Kein API Key gesetzt. Bitte konfigurieren Sie Ihren Claude API Key.');
    }
  }

  // Validate URL
  if (!url || !url.trim()) {
    throw new Error('Bitte geben Sie eine gültige URL ein');
  }

  let normalizedUrl = url.trim();
  if (!normalizedUrl.match(/^https?:\/\//i)) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  // Check domain reputation
  const domainReputation = checkDomainReputation(normalizedUrl);

  // Scrape content
  const scrapedData = await scrapeUrl(normalizedUrl);

  if (!scrapedData.success) {
    throw new Error(`Scraping fehlgeschlagen: ${scrapedData.error}`);
  }

  const { title, content, author, publishDate, links, wordCount } = scrapedData.content;

  // Create analysis prompt
  const prompt = createAnalysisPrompt(normalizedUrl, title, content, author, publishDate, links, wordCount);

  // Call Claude API
  try {
    const message = await claudeClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const analysisText = message.content[0].text;
    const analysis = parseClaudeResponse(analysisText);

    // Classify sources
    const classifiedSources = classifySources(analysis.sources);

    // Calculate final rating
    const finalRating = calculateFinalRating(
      analysis.rating,
      domainReputation,
      classifiedSources,
      analysis
    );

    return {
      success: true,
      url: normalizedUrl,
      analysis: {
        rating: finalRating.rating,
        ratingColor: finalRating.color,
        ratingLabel: finalRating.label,
        justification: analysis.justification,
        summary: analysis.summary,
        sources: classifiedSources,
        metadata: {
          author,
          publishDate,
          wordCount,
          sourceCount: classifiedSources.length,
          domainReputation: domainReputation.type
        },
        warnings: analysis.warnings || [],
        aiContentSuspicion: analysis.aiContentSuspicion || 'niedrig'
      }
    };

  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`AI-Analyse fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Domain reputation lists
 */
const FAKE_NEWS_BLACKLIST = [
  'compact-online.de',
  'anonymousnews.org',
  'pi-news.net',
  'journalistenwatch.com',
  'wochenblick.at'
];

const TRUSTED_SOURCES = [
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

function checkDomainReputation(url) {
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

function createAnalysisPrompt(url, title, content, author, publishDate, links, wordCount) {
  return `Du bist ein Experte für Medienanalyse und Faktenprüfung. Analysiere den folgenden Artikel auf Seriosität, Quellenqualität und mögliche Desinformation.

**URL:** ${url}
**Titel:** ${title}
**Autor:** ${author || 'Nicht angegeben'}
**Veröffentlichungsdatum:** ${publishDate || 'Nicht angegeben'}
**Wortanzahl:** ${wordCount}

**Inhalt (Auszug):**
${content.substring(0, 8000)}

**Gefundene Links (potenzielle Quellen):**
${links.slice(0, 30).map((link, i) => `${i + 1}. [${link.text}](${link.href})`).join('\n')}

---

**AUFGABE:**

Analysiere diesen Artikel systematisch und bewerte ihn nach folgenden Kriterien:

1. **QUELLENQUALITÄT:**
   - Welche echten Quellen werden zitiert?
   - Sind es Primär- oder Sekundärquellen?
   - Klassifiziere jede Quelle:
     * Wissenschaftliche Publikation (peer-reviewed, DOIs)
     * Seriöse Medien (etablierte Nachrichtenportale)
     * Offizielle Statistiken (Regierung, Eurostat, destatis)
     * Experteninterview (mit nachprüfbarer Person)
     * Soziale Medien / Blogs
     * Keine Quellenangabe

2. **INHALTLICHE QUALITÄT:**
   - Werden Fakten von Meinung getrennt?
   - Gibt es belegbare Behauptungen?
   - Werden verschiedene Perspektiven dargestellt?

3. **KI-CONTENT ERKENNUNG:**
   Prüfe auf typische KI-Textmuster:
   - Repetitive Strukturen
   - Typische KI-Phrasen
   - Fehlen von persönlichen Details

4. **TRANSPARENZ:**
   - Ist der Autor erkennbar?
   - Gibt es Quellenangaben?

---

**AUSGABEFORMAT (Antworte NUR mit folgendem JSON-Format):**

\`\`\`json
{
  "rating": "GRÜN|GELB|ROT",
  "justification": "Maximal 600 Zeichen Begründung",
  "summary": "Maximal 600 Zeichen Zusammenfassung",
  "sources": [
    {
      "title": "Titel der Quelle",
      "url": "https://...",
      "type": "wissenschaftlich|medien|statistik|experte|social_media|keine",
      "date": "YYYY-MM-DD oder leer",
      "trustworthy": true/false
    }
  ],
  "warnings": ["Liste von Warnsignalen"],
  "aiContentSuspicion": "niedrig|mittel|hoch"
}
\`\`\`

Antworte NUR mit dem JSON-Objekt!`;
}

function parseClaudeResponse(responseText) {
  try {
    let jsonText = responseText.trim();

    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    const parsed = JSON.parse(jsonText);

    return {
      rating: parsed.rating || 'GELB',
      justification: parsed.justification || 'Keine Begründung verfügbar',
      summary: parsed.summary || 'Keine Zusammenfassung verfügbar',
      sources: parsed.sources || [],
      warnings: parsed.warnings || [],
      aiContentSuspicion: parsed.aiContentSuspicion || 'niedrig'
    };

  } catch (error) {
    console.error('Failed to parse Claude response:', error);
    return {
      rating: 'GELB',
      justification: 'Analyse konnte nicht vollständig durchgeführt werden.',
      summary: responseText.substring(0, 600),
      sources: [],
      warnings: ['Automatische Analyse fehlgeschlagen'],
      aiContentSuspicion: 'mittel'
    };
  }
}

function classifySources(sources) {
  if (!sources || !Array.isArray(sources)) {
    return [];
  }

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

  return sources.map(source => {
    const type = source.type || 'keine';
    let domain = '';
    try {
      domain = new URL(source.url).hostname.replace('www.', '');
    } catch {}

    return {
      title: source.title || 'Unbekannte Quelle',
      url: source.url || '#',
      type,
      typeLabel: SOURCE_TYPE_LABELS[type] || 'Unbekannt',
      icon: SOURCE_TYPE_ICONS[type] || '❓',
      date: source.date || null,
      trustworthy: source.trustworthy !== undefined ? source.trustworthy : false,
      domain
    };
  });
}

function calculateFinalRating(claudeRating, domainReputation, sources, analysis) {
  let rating = claudeRating;

  if (domainReputation.type === 'blacklisted') {
    rating = 'ROT';
  }

  if (domainReputation.type === 'trusted' && sources.length >= 3) {
    const trustedSourceCount = sources.filter(s => s.trustworthy).length;
    if (trustedSourceCount >= 2 && rating === 'GELB') {
      rating = 'GRÜN';
    }
  }

  if (analysis.aiContentSuspicion === 'hoch' && rating === 'GRÜN') {
    rating = 'GELB';
  }

  const ratingMap = {
    'GRÜN': { rating: 'GRÜN', color: '#22c55e', label: 'Vertrauenswürdig' },
    'GELB': { rating: 'GELB', color: '#eab308', label: 'Kritisch prüfen' },
    'ROT': { rating: 'ROT', color: '#ef4444', label: 'Nicht vertrauenswürdig' }
  };

  return ratingMap[rating] || ratingMap['GELB'];
}
