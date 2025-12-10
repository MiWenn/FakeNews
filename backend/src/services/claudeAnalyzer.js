import Anthropic from '@anthropic-ai/sdk';
import { checkDomainReputation } from '../utils/urlValidator.js';
import { classifySources } from '../utils/sourceClassifier.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Analyzes content using Claude AI
 */
export async function analyzeContent(url, scrapedContent) {
  const { title, content, author, publishDate, links, wordCount } = scrapedContent;

  // Check domain reputation first
  const domainReputation = checkDomainReputation(url);

  // Create analysis prompt for Claude
  const prompt = createAnalysisPrompt(url, title, content, author, publishDate, links, wordCount);

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const analysisText = message.content[0].text;

    // Parse Claude's response
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
    };

  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`AI-Analyse fehlgeschlagen: ${error.message}`);
  }
}

/**
 * Creates the prompt for Claude analysis
 */
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
   - Sind die Quellen aktuell und relevant?

2. **INHALTLICHE QUALITÄT:**
   - Werden Fakten von Meinung getrennt?
   - Gibt es belegbare Behauptungen?
   - Werden verschiedene Perspektiven dargestellt?
   - Sind die Daten aktuell im Kontext des Themas?

3. **KI-CONTENT ERKENNUNG:**
   Prüfe auf typische KI-Textmuster:
   - Repetitive Strukturen und gleichförmige Absätze
   - Typische KI-Phrasen ("Es ist wichtig zu beachten", "Zusammenfassend lässt sich sagen", "In der heutigen Zeit")
   - Fehlen von persönlichen Anekdoten oder spezifischen Details
   - Übermäßig ausgeglichene, "sichere" Formulierungen
   - Generische Einleitungen und Zusammenfassungen

4. **TRANSPARENZ:**
   - Ist der Autor erkennbar und recherchierbar?
   - Gibt es ein Impressum?
   - Ist die Intention des Artikels klar?

5. **WARNSIGNALE:**
   - Reißerische Überschriften
   - Emotionale Manipulation
   - Fehlende oder dubiose Quellen
   - Einseitige Darstellung
   - Verschwörungstheoretische Elemente

---

**AUSGABEFORMAT (Antworte NUR mit folgendem JSON-Format):**

\`\`\`json
{
  "rating": "GRÜN|GELB|ROT",
  "justification": "Maximal 600 Zeichen Begründung mit: Quellenqualität (2-3 Sätze), Aktualität (1 Satz), Besondere Auffälligkeiten",
  "summary": "Maximal 600 Zeichen Zusammenfassung des Artikelinhalts",
  "sources": [
    {
      "title": "Vollständiger Titel/Beschreibung der Quelle",
      "url": "https://...",
      "type": "wissenschaftlich|medien|statistik|experte|social_media|keine",
      "date": "YYYY-MM-DD oder leer",
      "trustworthy": true/false
    }
  ],
  "warnings": ["Liste konkreter Warnsignale oder leer"],
  "aiContentSuspicion": "niedrig|mittel|hoch"
}
\`\`\`

**BEWERTUNGSKRITERIEN:**

- **GRÜN:** Mehrere seriöse Quellen, aktuelle Daten, transparente Herkunft, klare Fakten-Trennung, keine KI-Warnsignale
- **GELB:** Wenige/unklare Quellen, veraltete Daten, mögliche KI-Generierung ohne Kennzeichnung, teilweise fehlende Transparenz
- **ROT:** Keine Quellen, widerlegte Behauptungen, reine Meinungsmache ohne Fakten, bekannte Fake-News-Domain, hohe KI-Verdacht mit Täuschungsabsicht

Antworte NUR mit dem JSON-Objekt, keine zusätzlichen Erklärungen!`;
}

/**
 * Parses Claude's JSON response
 */
function parseClaudeResponse(responseText) {
  try {
    // Extract JSON from potential markdown code blocks
    let jsonText = responseText.trim();

    // Remove markdown code blocks if present
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
    console.error('Response text:', responseText);

    // Fallback parsing
    return {
      rating: 'GELB',
      justification: 'Analyse konnte nicht vollständig durchgeführt werden. Bitte prüfen Sie die Quelle manuell.',
      summary: responseText.substring(0, 600),
      sources: [],
      warnings: ['Automatische Analyse fehlgeschlagen'],
      aiContentSuspicion: 'mittel'
    };
  }
}

/**
 * Calculate final rating based on multiple factors
 */
function calculateFinalRating(claudeRating, domainReputation, sources, analysis) {
  let rating = claudeRating;

  // Override rating if domain is blacklisted
  if (domainReputation.type === 'blacklisted') {
    rating = 'ROT';
  }

  // Upgrade rating if domain is trusted AND sources are good
  if (domainReputation.type === 'trusted' && sources.length >= 3) {
    const trustedSourceCount = sources.filter(s => s.trustworthy).length;
    if (trustedSourceCount >= 2 && rating === 'GELB') {
      rating = 'GRÜN';
    }
  }

  // Downgrade if high AI suspicion without disclosure
  if (analysis.aiContentSuspicion === 'hoch' && rating === 'GRÜN') {
    rating = 'GELB';
  }

  // Map to color and label
  const ratingMap = {
    'GRÜN': {
      rating: 'GRÜN',
      color: '#22c55e',
      label: 'Vertrauenswürdig'
    },
    'GELB': {
      rating: 'GELB',
      color: '#eab308',
      label: 'Kritisch prüfen'
    },
    'ROT': {
      rating: 'ROT',
      color: '#ef4444',
      label: 'Nicht vertrauenswürdig'
    }
  };

  return ratingMap[rating] || ratingMap['GELB'];
}
