# ALIFA Institute LMS

Sistem Manajemen Pembelajaran untuk ALIFA Institute, dibangun dengan Next.js, Neon Postgres, dan UI Supabase.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Neon Postgres
- **Auth**: NextAuth.js
- **UI**: Radix UI + Tailwind CSS + Supabase Theme

## Setup Development

1. Clone repo
2. Install dependencies: `npm install`
3. Setup environment: `cp .env.local.example .env.local`
4. Update `DATABASE_URL` di `.env.local`
5. Initialize database: `npm run db:init`
6. Seed sample data: `npm run db:seed`
7. Run dev server: `npm run dev`

## Folder Structure

Lihat `STRUKTUR_FILE_LENGKAP` untuk detail.