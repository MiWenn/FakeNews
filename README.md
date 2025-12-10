# FakeNews Analyzer

Ein intelligentes Tool zur Analyse von URLs und deren Inhalten auf Seriosität, Quellenqualität und potenzielle Fake News.

## Features

### 🔍 Automatische Inhaltsanalyse
- Extraktion des Haupttexts aus URLs
- Identifikation und Analyse aller genannten Quellen
- Unterscheidung zwischen Primär- und Sekundärquellen
- Kategorisierung der Quellentypen (wissenschaftlich, Medien, Statistiken, etc.)

### 🚦 Ampel-Bewertungssystem
- **GRÜN:** Vertrauenswürdig - Mehrere seriöse Quellen, aktuelle Daten, transparente Herkunft
- **GELB:** Kritisch prüfen - Wenige/unklare Quellen, veraltete Daten, fehlende Transparenz
- **ROT:** Nicht vertrauenswürdig - Keine Quellen, widerlegte Behauptungen, bekannte Fake-News-Domain

### 🤖 KI-gestützte Bewertung
- Intelligente Quellenextraktion mit Claude AI
- Kontextuelle Bewertung der Seriosität
- KI-Texterkennungs-Heuristiken
- Aktualitätsprüfung im thematischen Kontext

### 📊 Detaillierte Ergebnisse
- Übersichtliche Quellenliste mit Klassifizierung
- Begründung der Bewertung (max. 600 Zeichen)
- Inhaltszusammenfassung
- Metadaten (Autor, Datum, Wortanzahl, etc.)
- Warnsignale bei problematischen Inhalten

## Tech Stack

### Backend
- **Node.js** + **Express** - REST API Server
- **Cheerio** - Schnelles Web-Scraping für statische Seiten
- **Puppeteer** - Web-Scraping für JavaScript-intensive Seiten
- **Claude AI API** - Intelligente Content-Analyse
- **Axios** - HTTP Client

### Frontend
- **React** - UI Framework
- **Vite** - Build Tool und Dev Server
- **CSS3** - Responsive Design (Mobile-First)

## Installation

### Voraussetzungen
- Node.js 18+ und npm
- Claude API Key (von Anthropic)

### Setup

1. **Repository klonen**
```bash
git clone <repository-url>
cd FakeNews
```

2. **Dependencies installieren**
```bash
npm run install-all
```

3. **Backend-Umgebungsvariablen konfigurieren**
```bash
cd backend
cp .env.example .env
```

Trage deinen Claude API Key in die `.env` ein:
```
PORT=3001
ANTHROPIC_API_KEY=dein_api_key_hier
NODE_ENV=development
```

4. **Frontend-Umgebungsvariablen konfigurieren** (optional)
```bash
cd ../frontend
cp .env.example .env
```

## Verwendung

### Development Mode

**Beide Server gleichzeitig starten (empfohlen):**
```bash
npm run dev
```

**Oder einzeln starten:**

Backend (Port 3001):
```bash
npm run dev:backend
```

Frontend (Port 3000):
```bash
npm run dev:frontend
```

Die Anwendung ist dann erreichbar unter: **http://localhost:3000**

### Production Build

```bash
npm run build
npm start
```

## Projektstruktur

```
FakeNews/
├── backend/
│   ├── src/
│   │   ├── server.js              # Express Server
│   │   ├── routes/
│   │   │   └── analyze.js         # API Route für URL-Analyse
│   │   ├── services/
│   │   │   ├── scraper.js         # Web-Scraping (Cheerio/Puppeteer)
│   │   │   └── claudeAnalyzer.js  # Claude AI Integration
│   │   └── utils/
│   │       ├── urlValidator.js    # URL-Validierung + Domain-Listen
│   │       └── sourceClassifier.js # Quellenklassifizierung
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx         # Header-Komponente
│   │   │   ├── URLInput.jsx       # URL-Eingabefeld
│   │   │   ├── LoadingSpinner.jsx # Loading-Animation
│   │   │   ├── TrafficLight.jsx   # Ampel-Bewertung
│   │   │   ├── ResultDisplay.jsx  # Ergebnisanzeige
│   │   │   ├── SourcesList.jsx    # Quellenliste
│   │   │   ├── ExampleURLs.jsx    # Beispiel-URLs
│   │   │   └── History.jsx        # Verlauf
│   │   ├── services/
│   │   │   └── api.js             # Backend API Client
│   │   ├── utils/
│   │   │   └── storage.js         # LocalStorage Utilities
│   │   ├── App.jsx                # Haupt-App-Komponente
│   │   └── main.jsx               # Entry Point
│   └── package.json
│
└── package.json                    # Root Workspace Config
```

## API Endpoints

### POST `/api/analyze`

Analysiert eine URL und gibt eine detaillierte Bewertung zurück.

**Request Body:**
```json
{
  "url": "https://example.com/artikel"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com/artikel",
  "analysis": {
    "rating": "GRÜN|GELB|ROT",
    "ratingColor": "#22c55e",
    "ratingLabel": "Vertrauenswürdig",
    "justification": "Begründung der Bewertung...",
    "summary": "Zusammenfassung des Inhalts...",
    "sources": [...],
    "metadata": {
      "author": "Max Mustermann",
      "publishDate": "2024-01-15",
      "wordCount": 1523,
      "sourceCount": 5,
      "domainReputation": "trusted"
    },
    "warnings": [...],
    "aiContentSuspicion": "niedrig|mittel|hoch"
  }
}
```

## Bewertungskriterien

Die Analyse berücksichtigt folgende Faktoren:

1. **Quellenqualität**
   - Anzahl der Quellen
   - Typ der Quellen (wissenschaftlich, Medien, Statistiken, etc.)
   - Vertrauenswürdigkeit der Quellen
   - Primär- vs. Sekundärquellen

2. **Aktualität**
   - Veröffentlichungsdatum
   - Aktualität der verwendeten Daten
   - Relevanz im aktuellen Kontext

3. **Transparenz**
   - Erkennbarer Autor
   - Klare Quellenangaben
   - Impressum vorhanden

4. **Content-Qualität**
   - Trennung von Fakten und Meinung
   - Belegbare Behauptungen
   - Verschiedene Perspektiven

5. **KI-Content Erkennung**
   - Repetitive Muster
   - Typische KI-Phrasen
   - Fehlen persönlicher Details

6. **Domain-Reputation**
   - Blacklist bekannter Fake-News-Domains
   - Whitelist vertrauenswürdiger Quellen

## Bekannte Einschränkungen

- Analyse kann 10-30 Sekunden dauern (abhängig von der Webseite)
- Paywall-geschützte Inhalte können möglicherweise nicht analysiert werden
- Einige JavaScript-intensive Seiten können Probleme bereiten
- Die Analyse ersetzt keine manuelle Faktenprüfung

## Zukünftige Features

- [ ] Batch-Analyse mehrerer URLs
- [ ] Export der Ergebnisse (PDF, JSON)
- [ ] Erweiterte Filter und Suchfunktionen
- [ ] Benutzerkonten und Cloud-Speicherung
- [ ] Browser-Extension
- [ ] Mehrsprachige Unterstützung (aktuell nur Deutsch)

## Lizenz

Dieses Projekt ist für Bildungszwecke erstellt.

## Support

Bei Fragen oder Problemen erstelle bitte ein Issue im GitHub-Repository.

---

**Wichtiger Hinweis:** Diese automatische Analyse dient als Hilfsmittel zur ersten Einschätzung. Bei wichtigen Entscheidungen sollten Sie immer zusätzliche manuelle Faktenprüfung durchführen
