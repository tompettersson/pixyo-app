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

### Product Scenes Tool

Background replacement for product photos with AI. Key documentation:

**`docs/product-scene-prompting-research.md`** - Identity preservation:
- Google's official prompting principles
- Working prompt templates for product fidelity
- Technical limitations and alternatives

**`docs/photorealism-prompting-guide.md`** - Photorealistic output:
- "Think like a photographer" approach (camera + lens + aperture)
- Terms to AVOID: "hyperrealistic", "ultra-detailed", "perfect"
- Terms that WORK: specific camera models, film stocks, natural imperfections
- Lighting terminology: "three-point softbox", "golden hour", etc.

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

## Deployment

### Production URL
https://pixyo.de (Custom Domain via Vercel)

### Vercel Project
- **Project Name**: pixyo-app
- **Framework**: Next.js (auto-detected)
- **Region**: Frankfurt (fra1)
- **Build Command**: `prisma generate && next build`

### Environment Variables (Vercel Dashboard)

All environment variables must be added manually in Vercel Dashboard → Settings → Environment Variables:

```bash
# AI Services
ANTHROPIC_API_KEY=sk-ant-...      # Claude API for prompt generation
GOOGLE_API_KEY=AIzaSy...           # Gemini API for image generation
UNSPLASH_ACCESS_KEY=...            # Unsplash image search

# Vertex AI (optional - enables imagen-product-recontext for better product fidelity)
# Requires: Google Cloud project with Vertex AI API enabled + Service Account
GOOGLE_CLOUD_PROJECT=pixyo-app    # Your GCP project ID
GOOGLE_CLOUD_LOCATION=europe-west1 # Vertex AI region (default: europe-west1)
# Authentication: Set GOOGLE_APPLICATION_CREDENTIALS or deploy to GCP environment

# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=...
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_...
STACK_SECRET_SERVER_KEY=ssk_...

# Optional
NEXT_PUBLIC_MOCK_AI=false          # Set to true to bypass AI APIs

# Auto-configured by Vercel
POSTGRES_URL=...                   # Vercel Postgres (Neon)
BLOB_READ_WRITE_TOKEN=...          # Vercel Blob Storage
```

**Note**: Vercel's "Import .env" button may not work reliably. Enter variables manually one by one.

### Deployment Triggers
- Push to `main` branch → automatic deployment
- Manual redeploy via Vercel Dashboard

## Authentication (Stack Auth)

### Configuration
- **Provider**: Stack Auth (@stackframe/stack v2.8.56)
- **Project ID**: 0a35349f-ad83-4c29-aad5-35356d0458a2
- **Registration**: Disabled (login only)
- **Auth Method**: Email + Password

### User Management via API

Create users with password using the Stack Auth Server API:

```bash
curl -X POST "https://api.stack-auth.com/api/v1/users" \
  -H "Content-Type: application/json" \
  -H "X-Stack-Access-Type: server" \
  -H "X-Stack-Project-Id: <project-id>" \
  -H "X-Stack-Secret-Server-Key: <server-key>" \
  -d '{
    "primary_email": "user@example.com",
    "password": "securepassword",
    "primary_email_verified": true,
    "primary_email_auth_enabled": true,
    "display_name": "User Name"
  }'
```

### Current Users
- tom@actualize.de (Admin)
- susan@actualize.de

## Environment Variables (Local Development)

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
