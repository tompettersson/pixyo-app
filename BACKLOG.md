# Pixyo Backlog

## 🟡 Ready

### 1. Landing Page verbessern
**Priorität:** Mittel

**Tasks:**
- [ ] Ansprechende Landing Page mit Feature-Übersicht
- [ ] Beispiel-Bilder zeigen
- [ ] Pricing-Sektion (auch wenn erstmal nur Free)

---

### 2. Usage Tracking & Limits
**Priorität:** Mittel
**Abhängig von:** Authentication ✅

**Tasks:**
- [ ] Generierungen pro User tracken
- [ ] Free Tier Limit definieren (z.B. 10 Bilder/Monat)
- [ ] UI-Feedback wenn Limit erreicht
- [ ] Später: Upgrade-Option

---

### 3. Erstes Profile automatisch erstellen
**Priorität:** Niedrig

**Tasks:**
- [ ] Bei erstem Editor-Besuch automatisch ein Default-Profile erstellen
- [ ] Welcome-Flow für neue User

---

## 🔴 Blocked

*Keine blockierten Tasks*

---

## ✅ Done

### 2026-01-02: Authentication mit Stack Auth
- Stack Auth SDK installiert (`@stackframe/stack`)
- StackProvider in `app/layout.tsx` eingerichtet
- Handler-Route erstellt (`app/handler/[...stack]/page.tsx`)
- Editor-Route geschützt (nur eingeloggte User)
- Login/Signup Links auf Landing Page
- User-ID mit Profile verknüpft (Schema erweitert)
- API Routes mit User-Ownership Checks
- E2E Tests: 4/4 passed
- Commit: 18a238f

### 2026-01-02: Datenbank Setup
- Prisma & Neon PostgreSQL konfiguriert
- Profile und Asset Models erstellt
- Migration erfolgreich

### Vorher (anderes LLM):
- API Routes für Profiles und Assets
- Background Image Controls (Scale, Position)
- Asset Library mit Blob Storage
- Profile Configuration UI
- Style Presets
- Canvas Editor mit react-konva
- Undo/Redo mit Zundo
- AI Integration (Claude + Gemini)

---

## 📝 Notizen

**Testing-Strategie:**
- Playwright: Automatisierte E2E-Tests
- Claude for Chrome: Manuelle User-Tests, explorative Tests

**Auth-Entscheidung:**
Stack Auth (Neon Auth) gewählt weil:
- Bereits in Neon integriert
- Open Source, Self-Hosting möglich
- Einfache Next.js Integration
- OAuth + Email/Password + Magic Links
