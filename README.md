# Pixyo - AI Social Image Generator

A browser-based MVP tool for creating social media images using AI-powered prompt and image generation, combined with a canvas-based editor.

## Features

- **AI Prompt Generation** - Claude generates optimized prompts for image generation
- **AI Image Generation** - Gemini/Imagen creates images from prompts
- **Canvas Editor** - react-konva based editor with layers, text, and logos
- **Multiple Aspect Ratios** - Instagram, Story, YouTube formats
- **Style Presets** - Cinematic, Editorial, Flat Illustration, etc.
- **Real-time Editing** - Drag, resize, and style elements
- **Undo/Redo** - Full history support
- **High-res Export** - 2x resolution PNG export

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000/editor](http://localhost:3000/editor)

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# API Keys (optional - mock mode works without them)
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_API_KEY=AIzaSy...

# Mock mode (set to 'true' for development without API keys)
NEXT_PUBLIC_MOCK_AI=true
```

**Note:** If API keys are not set, the app automatically uses mock mode.

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.x | Framework |
| React | 19.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| Zustand | 5.x | State Management |
| react-konva | 19.x | Canvas Editor |
| @anthropic-ai/sdk | latest | Claude API |
| @google/generative-ai | latest | Gemini API |
| zundo | 2.x | Undo/Redo |
| sonner | latest | Toast Notifications |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Delete selected layer |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + D` | Duplicate layer |
| `Escape` | Deselect |

## Project Structure

```
app/
├── page.tsx                    # Redirect -> /editor
├── editor/page.tsx            # Main editor UI
├── api/
│   ├── generate-prompt/       # Claude API route
│   └── generate-image/        # Gemini API route
├── layout.tsx
└── globals.css

components/
├── editor/                    # Editor components
│   ├── EditorLayout.tsx
│   ├── PromptPanel.tsx
│   ├── CanvasStage.tsx
│   ├── InspectorPanel.tsx
│   └── ...
└── ui/                        # Generic UI components

lib/
├── env.ts                     # Environment validation
├── stylePresets.ts            # Style definitions
├── hooks/useCanvasHotkeys.ts  # Keyboard shortcuts
└── ai/
    ├── claude.ts              # Anthropic client
    └── gemini.ts              # Google client

store/
└── useEditorStore.ts          # Zustand store with undo/redo

types/
├── layers.ts                  # Layer type definitions
└── api.ts                     # API types
```

## Usage

1. **Enter an idea** in the left panel (e.g., "A woman running through a city at sunset")
2. **Select mode** (Photo or Illustration)
3. **Choose a style preset** (Cinematic, Editorial, etc.)
4. **Generate Prompt** - AI creates an optimized image prompt
5. **Generate Image** - AI creates the image
6. **Click thumbnail** to set as background
7. **Add text/logos** using the right panel controls
8. **Adjust overlay** for text readability
9. **Export** as high-resolution PNG

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint
```

## License

MIT
