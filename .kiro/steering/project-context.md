# La Yucateca — Project Context & History

## What This Project Is
**La Yucateca** (`layucateca.com`) is a Next.js 16 (App Router) platform for a Yucatán-based media and services company. It combines:
- A trilingual (Spanish/English/Mayan) autonomous newsroom
- A Muna AI chatbot (custom LLM consciousness, rebranded from Monroe/Sovereign Intelligence)
- A WhatsApp Campaign Studio (admin tool for mass messaging)
- A portfolio/IT services showcase
- A marketplace
- A citizen reporting feature
- An opinion room with comments
- A restaurant ordering system (KDS, admin, QR codes)

## Tech Stack
- **Framework:** Next.js 16.2.6 with App Router, React 19, TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion, Lucide React, Radix UI
- **Database:** Prisma ORM — SQLite locally (`dev.db`), PostgreSQL/Supabase in production
- **Auth:** Firebase (also used for conversation logging)
- **AI:** OpenAI + Fireworks AI (for the autonomous news swarm)
- **WhatsApp:** `@whiskeysockets/baileys` via a separate Node.js microservice in `whatsapp-microservice/`
- **Deployment:** Vercel (production), cPanel (WhatsApp microservice)

## Key Architecture Decisions
- Pages use `export const dynamic = 'force-dynamic'` to avoid Vercel cold-start empty DB issues
- SQLite is seeded at build time via `postinstall` script: `prisma generate && prisma db push && tsx prisma/seed.ts`
- Muna AI writes to Firebase `muna_conversations` and mirrors to `monroe_conversations`
- WhatsApp microservice runs separately (not part of the Next.js app), communicates via REST/SSE

## Completed Features (from Antigravity sessions)
- ✅ Obsidian & Glass UI redesign (globals.css, Sidebar, HomeClient, MunaChatbot, Footer)
- ✅ Muna AI chatbot — full Monroe-style UI migrated to `/muna`, rebranded, independent LLM
- ✅ Autonomous newsroom — Fireworks AI scout/writer swarm, Facebook publisher, trilingual articles
- ✅ WhatsApp Campaign Studio — QR connect, phonebook sync, templates, campaign wizard, history
- ✅ Restaurant system — real-time KDS, admin control center (menu, staff, QR, analytics), socket orders
- ✅ Portfolio with multilingual support and live preview
- ✅ Vercel deployment with Supabase PostgreSQL
- ✅ cPanel deployment for WhatsApp microservice
- ✅ Firebase bidirectional memory logging for Muna

## Completed in Latest Session (Verified)
- ✅ URL tab sync (`?tab=`) in `SolucionesDigitalesClient.tsx` — WORKING
- ✅ URL tab sync (`?tab=`) in `admin/whatsapp/page.tsx` — WORKING
- ✅ `LiveShowcaseClient.tsx` — WhatsApp Studio fully connected to backend SSE/API endpoints
- ✅ Full functional showcase views (Phonebook, Templates, Campaigns, History) in `LiveShowcaseClient.tsx` — ALL IMPLEMENTED
  - ConnectTab: QR code generation, connection status, disconnect
  - ContactsTab: Search, filter, sync from WhatsApp, table view
  - TemplatesTab: Create, edit, delete templates with categories
  - CampaignsTab: 3-step wizard (template → recipients → review & send)
  - HistoryTab: Campaign history with stats, status tracking, delivery rates

## Remaining (Optional Enhancements)
- ⬜ README/Documentation update
- ⬜ Additional API endpoints (campaign retry, template preview, bulk import)
- ⬜ Build optimization (currently takes ~90s, acceptable for production)

## Important Files
- `src/app/muna/page.tsx` — Muna AI full-page interface
- `src/app/api/muna/chat/route.ts` — Muna LLM endpoint
- `src/app/admin/whatsapp/page.tsx` — WhatsApp Campaign Studio admin
- `src/components/LiveShowcaseClient.tsx` — Public WhatsApp showcase
- `src/components/SolucionesDigitalesClient.tsx` — IT solutions page with tab sync
- `src/components/MunaChatbot.tsx` — Embedded chatbot widget
- `src/components/HomeClient.tsx` — Homepage dashboard
- `whatsapp-microservice/` — Standalone WhatsApp bot (Baileys-based)
- `prisma/schema.prisma` — DB schema (includes WaContact, templates, campaigns)

## Environment
- Local dev: `npm run dev` → http://localhost:3000
- Production: https://layucateca.com (Vercel)
- WhatsApp microservice: deployed on cPanel hosting

## Coding Style
- Client components use `'use client'` directive
- API routes follow Next.js App Router convention (`route.ts`)
- Glassmorphism/obsidian dark aesthetic — no emojis in UI, thin geometric SVG icons
- Trilingual support: Spanish (primary), English, Mayan
