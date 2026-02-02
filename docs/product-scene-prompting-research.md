# Prompt Engineering für Produktfotografie mit Gemini

**Kurz gefasst:** Für den Anwendungsfall "Produktbild mit weißem Hintergrund → neuer Hintergrund, Produkt vollständig unverändert" gibt es keine KI, die Logos und Text 100% zuverlässig erhält. Die zuverlässigste Lösung ist ein **zweistufiger Workflow**: Hintergrund entfernen → neuen Hintergrund separat generieren → Compositing.

---

## Googles offizielle Prompting-Prinzipien

### 1. Narrative Beschreibungen statt Keyword-Listen
> "A narrative, descriptive paragraph will almost always produce a better, more coherent image than a list of disconnected words."

### 2. Explizites Benennen für lokale Bearbeitungen
Sowohl das zu ändernde Element als auch der gewünschte Zustand müssen klar formuliert werden:
- "Remove the door mirror"
- "Make the landscape snowy"
- "Fix the sign, make it say 'GAS'"

### 3. Semantische Positiv-Formulierungen
Statt Negationen besser positiv formulieren:
- ❌ "Don't show the tongue"
- ✅ "The dog's mouth is closed"
- ❌ "Don't modify the product"
- ✅ "Keep the product exactly as shown"

### 4. Identitäts-Marker
- "The exact [product] from the image"
- "Keep all details, text, logos exactly"
- Referenzbilder für Konsistenz nutzen

---

## Funktionierende Prompt-Templates

### Template 1: Basis-Prompt
```
Using the provided image of [PRODUKTNAME], create a professional e-commerce lifestyle photo.
Place the exact product from the image on [OBERFLÄCHE] in [SETTING].
The lighting should be [BELEUCHTUNG].
Do not modify the product itself - keep all details, text, logos, and brand elements exactly as shown.
Generate a realistic shot with shadows adjusted to match the environment.
Product photography style, high resolution.
```

### Template 2: Markdown-strukturiert (empfohlen für Gemini 3)
```
Create a professional product photograph featuring:

**Subject:**
- The exact product from the provided image
- Placed on [OBERFLÄCHE] in [SETTING]

**Technical Requirements:**
- Studio lighting matching [RICHTUNG], soft shadows
- Product photography style, DSLR quality

**Critical Constraints:**
- Product MUST remain EXACTLY as shown
- All logos, text, brand elements, textures unchanged
- Only the background changes
- Shadows and reflections adjusted to match new environment
```

---

## Was NICHT funktioniert

Diese Formulierungen sind **unzuverlässig**:
- "The same product" – wird locker interpretiert
- "Identity preserved" – wird nicht konsistent verstanden
- "Unchanged" – bei höheren Denoise-Werten ignoriert

---

## Technische Limitationen

- **Text/Typografie:** Erfordert häufig Nachbearbeitung
- **Feine Details:** Kleine Logos können verfälscht werden
- **Keine Pixel-perfekte Kopie:** Generative Modelle rekonstruieren, sie kopieren nicht

---

## Automatischer Feedback-Loop (implementiert)

Nach jeder Generierung läuft automatisch ein zweiter API-Call:

1. **Turn 1**: Initiale Generierung (Produkt + Szenen-Prompt)
2. **Turn 2**: Vergleichs-Call (Original + generiertes Bild → Korrektur)

Der Feedback-Loop sendet das **Original-Produktbild als Referenz** zusammen mit dem generierten Ergebnis. Gemini vergleicht beide und korrigiert Abweichungen bei Logos, Text, Form, Farben.

---

## Alternative: Zweistufiger Workflow (100% Produkterhaltung)

1. **Hintergrund entfernen** (rembg, remove.bg, Photoroom)
2. **Neuen Hintergrund separat generieren** (ohne Produkt)
3. **Compositing** in Canvas/Photoshop

Dies garantiert Produkterhaltung, da das Original nie durch ein generatives Modell läuft.

---

## Tool-Vergleich 2025

| Tool | Produkterhaltung | Text/Logo-Treue |
|------|------------------|-----------------|
| Claid.ai | Exzellent | Exzellent |
| Vertex AI Imagen 3 | Gut | Gut |
| Gemini 3 Pro | Gut (iterativ) | Mäßig |
| GPT-4o | Gut | Sehr gut |

---

*Recherche: Januar 2026*
