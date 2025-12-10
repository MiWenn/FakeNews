# GitHub Pages Deployment - Anleitung

Die FakeNews Analyzer App läuft jetzt **komplett im Browser** ohne Backend!

## 🎉 Schnellstart

### 1. Pull Request erstellen und mergen

Erstelle einen Pull Request unter:
```
https://github.com/MiWenn/FakeNews/compare/main...claude/url-content-analysis-013osh1wUDyBvvaRFV4ZdEvm
```

Oder klicke im Repository auf den gelben Banner "Compare & pull request".

**Merge den PR zum main-Branch!**

### 2. GitHub Pages aktivieren

1. Gehe zu: **Settings → Pages**
2. Unter "Source": Wähle **GitHub Actions**
3. Fertig! GitHub Actions deployt automatisch

### 3. Warte auf Deployment

- Gehe zum **Actions** Tab
- Warte bis der "Deploy Frontend to GitHub Pages" Workflow durchgelaufen ist (~2-3 Min)

### 4. Deine App ist live! 🚀

```
https://miwenn.github.io/FakeNews/
```

---

## 📱 Wie funktioniert die App jetzt?

### Kein Backend erforderlich!

Die App läuft **vollständig im Browser**:

- ✅ **Web Scraping** über CORS-Proxy (allOrigins)
- ✅ **Claude AI** direkt vom Frontend
- ✅ **Alle Analyselogik** im Browser
- ✅ **Zero Server Costs**
- ✅ **Sofortiges Deployment**

### API Key Setup

Beim ersten Besuch musst du:

1. **Eigenen Claude API Key eingeben** (von Anthropic)
2. Key wird in **localStorage** gespeichert (nur in deinem Browser)
3. Key wird **nie an einen Server gesendet**

### Claude API Key erhalten

1. Gehe zu [console.anthropic.com](https://console.anthropic.com/)
2. Erstelle einen Account
3. Navigiere zu "API Keys"
4. Erstelle einen neuen Key
5. Kopiere und speichere ihn in der App

---

## 🔒 Sicherheit

### ⚠️ Wichtiger Hinweis

Der API Key wird im **Browser localStorage** gespeichert. Das bedeutet:

- ✅ **Gut für:** Private Nutzung, Testing, Demos
- ❌ **Nicht gut für:** Öffentliche Production-Apps mit vielen Nutzern
- ⚠️ **Beachte:** Jeder mit Zugriff auf deinen Browser kann den Key sehen

### Empfehlungen

- **Für Demos:** Nutze einen API Key mit niedrigem Limit
- **Für Production:** Implementiere ein Backend (siehe DEPLOYMENT.md)
- **Auf öffentlichen PCs:** Lösche den Key nach Nutzung

---

## 🛠️ Technische Details

### Was wurde geändert?

**Vorher:**
- Backend (Node.js + Express)
- Frontend ruft Backend API auf
- Backend macht Scraping und Claude API Calls

**Nachher:**
- Nur Frontend (React)
- CORS-Proxy für Scraping
- Direkte Claude API Calls vom Browser
- Kein Backend nötig

### Architektur

```
Browser
  ├── React App
  ├── allOrigins CORS Proxy ──→ Target Website (scraping)
  └── Claude API ──→ Anthropic Server (analysis)
```

### Dependencies

- `@anthropic-ai/sdk` - Claude AI SDK (mit Browser-Support)
- `react` - UI Framework
- `vite` - Build Tool

---

## 🚀 Lokales Testen

```bash
cd frontend

# Dependencies installieren
npm install

# Dev Server starten
npm run dev

# Production Build testen
npm run build:github
npm run preview
```

---

## 🐛 Troubleshooting

### Problem: API Key nicht akzeptiert

**Lösung:**
- Überprüfe, dass der Key mit `sk-ant-api03-` beginnt
- Stelle sicher, dass der Key gültig ist (teste auf console.anthropic.com)

### Problem: Scraping schlägt fehl

**Lösung:**
- Manche Websites blockieren CORS-Proxies
- Probiere eine andere URL
- Einige Websites mit starkem CORS-Schutz können nicht gescraped werden

### Problem: Build schlägt fehl

**Lösung:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build:github
```

### Problem: 404 beim Öffnen der App

**Lösung:**
- Stelle sicher, dass GitHub Pages auf "GitHub Actions" eingestellt ist
- Prüfe, ob der Workflow erfolgreich war (Actions Tab)
- Warte 5-10 Minuten nach dem Deployment

---

## 📊 Kosten

### GitHub Pages
- **Kostenlos** für öffentliche Repositories
- Unbegrenzter Traffic
- Automatische SSL-Zertifikate

### Claude API
- **Pay-per-use** Pricing
- ~$0.003 pro Analyse (ca. 15.000 Tokens)
- Setze Limits in der Anthropic Console

**Geschätzte Kosten bei 100 Analysen/Monat:** ~$0.30

---

## 🔄 Updates deployen

Jeder Push zum `main` Branch triggert automatisch ein neues Deployment!

```bash
# Änderungen machen
git add .
git commit -m "Update feature X"
git push origin main

# GitHub Actions deployt automatisch
```

---

## 📚 Weiterführende Dokumentation

- **DEPLOYMENT.md** - Alternative Deployment-Optionen (Vercel, Netlify)
- **README.md** - Projekt-Dokumentation
- **Frontend Code** - `/frontend/src/`

---

## ✅ Checkliste

- [ ] Pull Request erstellt und gemerged
- [ ] GitHub Pages aktiviert (Settings → Pages → GitHub Actions)
- [ ] Deployment erfolgreich (Actions Tab grün)
- [ ] App erreichbar unter `https://miwenn.github.io/FakeNews/`
- [ ] Claude API Key bereit
- [ ] API Key in der App konfiguriert
- [ ] Erste URL erfolgreich analysiert

---

**Viel Erfolg! 🎉**

Bei Problemen oder Fragen: Erstelle ein Issue im Repository.
