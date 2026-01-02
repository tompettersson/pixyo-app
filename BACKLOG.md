# Pixyo Backlog

## 🟡 Ready

### 1. Authentication mit Stack Auth (Neon Auth)
**Priorität:** Hoch
**Warum:** API-Kosten entstehen sofort, daher kein anonymer Zugriff

**Tasks:**
- [ ] Stack Auth SDK installieren (`@stackframe/stack`)
- [ ] StackProvider in `app/layout.tsx` einrichten
- [ ] Handler-Route erstellen (`app/handler/[...stack]/page.tsx`)
- [ ] Editor-Route schützen (nur eingeloggte User)
- [ ] Login/Signup Links auf Landing Page
- [ ] User-ID mit Profile verknüpfen (Schema erweitern)

**Referenz:** [Stack Auth Setup](https://docs.stack-auth.com/docs/next/getting-started/setup)

---

### 2. User-Profile Verknüpfung
**Priorität:** Hoch
**Abhängig von:** #1 Authentication

**Tasks:**
- [ ] Prisma Schema erweitern: `userId` auf Profile Model
- [ ] Migration erstellen
- [ ] API Routes anpassen (nur eigene Profiles laden/bearbeiten)
- [ ] Automatisch erstes Profile für neuen User erstellen

---

### 3. Landing Page
**Priorität:** Mittel

**Tasks:**
- [ ] Ansprechende Landing Page mit Feature-Übersicht
- [ ] Login/Signup CTAs
- [ ] Beispiel-Bilder zeigen
- [ ] Pricing-Sektion (auch wenn erstmal nur Free)

---

### 4. Usage Tracking & Limits
**Priorität:** Mittel
**Abhängig von:** #1, #2

**Tasks:**
- [ ] Generierungen pro User tracken
- [ ] Free Tier Limit definieren (z.B. 10 Bilder/Monat)
- [ ] UI-Feedback wenn Limit erreicht
- [ ] Später: Upgrade-Option

---

## 🔴 Blocked

*Keine blockierten Tasks*

---

## ✅ Done

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
