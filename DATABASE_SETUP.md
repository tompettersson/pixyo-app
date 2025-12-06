# Database & Blob Storage Setup

This guide explains how to set up the database and blob storage for the Pixyo app.

## Prerequisites

You need the following environment variables from Vercel:
- `POSTGRES_URL` - Vercel Neon Postgres database connection string
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage access token

## Step 1: Add Environment Variables

### Local Development

Create or update `.env.local` in the project root:

```bash
# Existing variables
ANTHROPIC_API_KEY=your_key
GOOGLE_API_KEY=your_key
UNSPLASH_ACCESS_KEY=your_key

# New Database & Blob variables
POSTGRES_URL=your_postgres_connection_string
BLOB_READ_WRITE_TOKEN=your_blob_token
```

### Production (Vercel)

Add these environment variables in your Vercel project settings:
1. Go to Project Settings → Environment Variables
2. Add `POSTGRES_URL` and `BLOB_READ_WRITE_TOKEN`
3. Redeploy the app

## Step 2: Run Database Migrations

After adding the environment variables, run the Prisma migration:

```bash
npx prisma migrate dev --name init
```

This will:
- Create the database tables (`Profile` and `Asset`)
- Generate the Prisma Client

## Step 3: Verify Setup

Start the development server:

```bash
npm run dev
```

Open the editor at `http://localhost:3000/editor`. The app will:
- Automatically create a default "Standard" profile if none exists
- Allow you to configure profiles via the settings icon (⚙️) in the top-left

## Database Schema

### Profile Model
Stores customer-specific configurations:
- Name, logo URL
- Colors (dark, light, accent)
- Fonts (headline and body with sizes, families)
- Layout settings (padding, gaps, button styling)
- System prompt for AI image generation

### Asset Model
Stores generated and Unsplash images:
- Type (GENERATED or UNSPLASH)
- URL (Blob storage URL or Unsplash URL)
- Dimensions (width, height)
- Metadata (prompt, credits, etc.)

## Features Implemented

### 1. Profile Management
- Create, edit, and switch between customer profiles
- Configure colors, fonts, layouts per profile
- Custom system prompts for each profile

### 2. Asset Library
- Save generated AI images to Blob storage
- Save selected Unsplash images
- View thumbnails organized by type (Generated vs Unsplash)
- Click thumbnails to load images as backgrounds

### 3. Background Controls
- Scale/zoom background images (0.5x to 2x)
- Position images horizontally and vertically
- Reset transformation with one click

### 4. Integration
- All generated images can be saved to the library
- Assets are associated with specific profiles
- Automatic profile initialization on first use

## Troubleshooting

### Migration Fails
- Ensure `POSTGRES_URL` is correctly set in your environment
- Check that the database is accessible from your network
- Verify the connection string format matches Prisma's requirements

### Blob Upload Fails
- Verify `BLOB_READ_WRITE_TOKEN` is set correctly
- Check Vercel Blob storage limits and quotas
- Ensure network access to Vercel's blob API

### Profile Not Loading
- Check browser console for API errors
- Verify the database migration ran successfully
- Try manually creating a profile via the API or settings UI

