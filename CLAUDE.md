# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000/editor)
npm run build    # Build for production
npm run lint     # Lint with ESLint
npm start        # Run production server
```

### Database (Prisma)

```bash
npx prisma migrate dev --name <name>  # Create and apply migration
npx prisma generate                    # Regenerate Prisma client
npx prisma studio                      # Open database GUI
```

Prisma client output: `lib/generated/prisma`

## Architecture

### Tech Stack
- Next.js 16 (App Router)
- React 19 with TypeScript
- Tailwind CSS 4
- Zustand 5 + Zundo (state with undo/redo)
- react-konva (canvas rendering)
- Prisma + Vercel Postgres
- Vercel Blob storage

### State Management

The editor uses a single Zustand store (`store/useEditorStore.ts`) with temporal middleware for undo/redo:

- **Canvas state**: dimensions, aspect ratio, background color
- **Layers**: array of typed layers (background, text, logo, image, rect)
- **UI state**: selected layer, overlay opacity, generation status
- **History**: 50-step undo/redo via `useTemporalStore` hook

Layer types are defined in `types/layers.ts`. The background layer always has `id: 'background'` and is positioned at index 0.

### AI Integration

Two AI services, both with automatic mock mode fallback:

1. **Prompt generation** (`lib/ai/claude.ts`): Claude generates optimized prompts from user ideas
2. **Image generation** (`lib/ai/gemini.ts`): Google Gemini 3 creates images from prompts

Mock mode activates when `NEXT_PUBLIC_MOCK_AI=true` or API keys are missing.

### API Routes

- `POST /api/generate-prompt` - Claude prompt generation
- `POST /api/generate-image` - Gemini image generation
- `GET/POST /api/profiles` - Profile CRUD
- `GET/PUT/DELETE /api/profiles/[id]` - Single profile operations
- `GET/POST /api/assets` - Asset library management
- `GET /api/unsplash` - Unsplash search proxy

All routes use Zod for request validation.

### Data Models

**Profile**: Customer configurations (colors, fonts, logo, system prompt)
**Asset**: Saved images (generated or Unsplash) linked to profiles

## Environment Variables

```bash
# Required for AI (optional with mock mode)
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIzaSy...

# Optional
NEXT_PUBLIC_MOCK_AI=true     # Force mock mode
UNSPLASH_ACCESS_KEY=...       # Unsplash search

# Database & Storage (required for persistence)
POSTGRES_URL=...
BLOB_READ_WRITE_TOKEN=...
```

## Key Conventions

- Environment validation via Zod in `lib/env.ts`
- Style presets defined in `lib/stylePresets.ts` with prompt directives
- Canvas dimensions derive from aspect ratio constants in `types/layers.ts`
- Editor components in `components/editor/`, generic UI in `components/ui/`
