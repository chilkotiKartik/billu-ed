# ED Cat (ED Buddy)

Step-by-step Engineering Drawing helper for students: an installable phone web app (PWA) with animated pencil-and-compass lessons, a cat tutor, practice, XP and badges. Covers Sheets 1 to 3 (types of lines, points, projection of lines) in first angle, plus a generic line solver. Sheets are laid out on A1/A3 and download as PDF.

**Stack:** Next.js 16 (App Router) · React 19 · Clerk (auth) · Supabase (database) · Upstash Redis (optional, shared rate limits) · Gemini (optional, photo fallback) · Vercel (hosting).

## How a question is processed

1. **Photo** is read in the browser by Tesseract OCR; typed and ready questions skip this.
2. **Parser** (`src/lib/parser.ts`) extracts length, angles and end-A position with plain rules. If something is missing, the server (`/api/read`) may ask Gemini to read it; rule-found values always win. Gemini never solves or draws.
3. **Confirm screen** lets the student fix any OCR mistake.
4. **Solver** (`src/lib/solver.ts`, run by `/api/solve`) does the exact maths and builds the steps and the final sheet. Same input, same answer.
5. **Lesson player, steps, A1/A3 sheet, PDF.**

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the Clerk keys at least
npm run dev                  # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run typecheck` | TypeScript, whole project |
| `npm test` | Solver, parser, progress merge, API schemas, rate limiter and database-client tests |
| `npm run build` | Production build |

CI (`.github/workflows/ci.yml`) runs typecheck, tests, `npm audit` and a build on every push and pull request. Dependabot opens weekly update PRs.

## Deploy on Vercel

1. Push to GitHub, then **Add New Project** on Vercel and import the repo.
2. Add the environment variables from `.env.example` (Project Settings, Environment Variables).
3. In **Clerk**: switch the app to Production, add your Vercel domain, and use the production keys.
4. Deploy. Check `https://<your-domain>/api/health`; it shows which optional features are switched on (no secrets).

### Account storage (Supabase)

Without it the app still works; progress and sheets stay on the student's phone. To turn it on:

1. Create a Supabase project and run `supabase/migrations/0001_init.sql` in the SQL editor (or `supabase db push`).
2. Pick one:
   - **Direct:** set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
   - **Edge function (safer):** `supabase secrets set EDCAT_FN_TOKEN=<long random>`, run `supabase functions deploy edcat-sheets` (folder `supabase/functions/edcat-sheets`, JWT check is off via `supabase/config.toml`), and set `SUPABASE_URL` + the same `EDCAT_FN_TOKEN` in Vercel. The function refuses to run without a strong token.
3. Every table has row-level security on with no policies, so browsers can never read it. Only the server reaches it, and every query is scoped to the signed-in Clerk user id.

What gets stored: sheets (up to 100 per student), progress (finished questions, XP, streak, badge counters), name and roll number for the title block, and feedback messages. Progress **merges** between phone and account (union of finished questions, best counters), so a student never loses work by switching devices.

### Shared rate limiting (Upstash, recommended)

Serverless instances do not share memory, so set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (free tier is enough). Without them limits are per instance.

## Install on a phone

Chrome (Android): menu, **Install app**. iPhone Safari: Share, **Add to Home Screen**. The app shows a friendly offline page when there is no internet; progress is kept on the phone and syncs later.

## Optional: lecture videos

Set `YOUTUBE_API_KEY`, or pin videos once with `YOUTUBE_API_KEY=xxx npx tsx scripts/fetch-videos.ts` and review `src/lib/pinned.json`.

## Project map

- `src/lib/solver.ts`, `points.ts`, `derived.ts`, `sheet1.ts`, `catalog.ts`: maths, steps and all questions
- `src/lib/progress.ts`, `sync.ts`, `store.ts`: progress merge, account sync, saved sheets
- `src/lib/schemas.ts`: zod validation for every API body
- `src/lib/server/`: `http.ts` (auth, rate limit, validation), `ratelimit.ts`, `db.ts` (Supabase client)
- `src/app/api/*`: `solve`, `read`, `sheets`, `progress`, `profile`, `feedback`, `videos`, `health`
- `src/proxy.ts`: Clerk route protection
- `supabase/`: migrations and the optional edge function
- `scripts/`: preview and render helpers used during development

## Notes

- Have an ED lecturer check the steps against your textbook before students rely on them. The "Report a mistake" button in each step writes to the `feedback` table.
- Assumptions to confirm: Sheet 3 Q1 (C1 to C3) lines are 75 mm; Sheet 1 uses an original figure with BIS line types.
