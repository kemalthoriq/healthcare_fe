# Lumière Aesthetic Clinic — Frontend

Website for a beauty clinic: public treatment catalog, online booking with real-time slot availability, and an admin panel for bookings, therapists, schedules, patients, invoices, and promos.

Built with Next.js (App Router) on top of the [Lumière backend API](https://github.com/kemalthoriq/healthcare_be). The interface is in Indonesian.

## Features

**Public**
- Home, treatment catalog and detail pages, promos, and clinic profile with location
- Step-by-step booking: treatment, therapist, date, time slot, and patient details
- Booking without an account, with a booking code and a WhatsApp shortcut to the clinic
- Booking status page (`/booking/{code}`) with self-cancellation before the deadline
- Cloudflare Turnstile on booking forms and friendly rate-limit messages

**Admin and therapist** (`/admin`)
- Session login with role-based navigation: admins see the full panel, therapists only see the dashboard and their own bookings
- Dashboard summary: today's bookings, monthly revenue, top treatments
- Booking workflow: confirm, reschedule, cancel, complete, no-show, with treatment notes
- Treatments, therapists, therapist accounts, weekly schedules, and time off
- Patient search with booking history
- Invoices: create from a completed booking, apply discounts, record payments
- Promos and clinic settings
- Image uploads straight to Cloudinary using signed requests from the API

## Design highlights

- **Same-origin API.** The browser calls `/api/*`, which Next.js rewrites to the backend. Session cookies stay first-party and no CORS setup is needed.
- **Cached public pages.** Catalog data is fetched on the server with `"use cache"` and refreshed every few minutes, so public pages load fast even when the API is cold.
- **Route protection.** `proxy.ts` redirects requests to `/admin/*` without a session cookie to the login page; the API remains the source of truth for authorization.
- **Consistent error handling.** API errors map to field-level form errors, timeout and network messages, and rate-limit countdowns.
- **Clinic time zone.** Dates and times are displayed in `Asia/Jakarta`.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui (Radix UI), lucide-react |
| Data fetching | TanStack Query (client), cached server functions (public pages) |
| Forms | React Hook Form, Zod |
| Dates | date-fns, react-day-picker |
| Deployment | Vercel |

## Project structure

```
app/(public)/         public pages: home, treatment, promo, tentang, booking
app/admin/(auth)/     admin login
app/admin/(panel)/    admin pages: dashboard, booking, pasien, invoice,
                      jadwal, treatment, terapis, promo, pengaturan
components/           feature components (admin, booking, catalog, layout)
components/ui/        shadcn/ui primitives
lib/api/              typed API client per domain
lib/                  formatting, dates, schedule, and form helpers
proxy.ts              admin route guard
```

## Getting started

Requirements: Node.js 22 and a running [backend](https://github.com/kemalthoriq/healthcare_be).

```bash
cp .env.example .env.local
npm ci
npm run dev
```

The app runs on http://localhost:3000. Set `API_URL` to the backend address and make sure the backend's `FRONTEND_ORIGIN` is `http://localhost:3000`.

| Command | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types and run `tsc` |

## Configuration

| Variable | Description |
|---|---|
| `API_URL` | Backend base URL without `/api` and without a trailing slash. Read at build time for the `/api/*` rewrite and at runtime for server-side requests |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key. Inlined at build time; `1x00000000000000000000AA` is Cloudflare's always-pass test key |

## Deployment

The app is deployed on Vercel with Node.js 22 and the default Next.js build settings.

- Set both environment variables in the Vercel project. Changing either one requires a redeploy.
- Public pages fetch data during the build. If the API is unavailable, the build still succeeds and the pages fill in once the cache refreshes.
- Set the backend's `FRONTEND_ORIGIN` to the production URL and register the same hostname in the Turnstile widget.
