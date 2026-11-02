# ED Buddy

Step-by-step Engineering Drawing helper. Installable phone web app (PWA). Version 1 covers **projection of lines** (parallel to HP, parallel to VP, inclined to both) in first angle on an A3 sheet.

## How a question is processed (no AI, no paid API)

1. **Photo** → text is read **in the browser** by Tesseract OCR (free). **Typed** questions skip this. **Ready questions** skip it too.
2. **Parser** (`src/lib/parser.ts`) pulls out length, θ, φ, height above HP, distance in front of VP and the line name using plain rules.
2b. **Gemini fallback (optional)**: only if the rules could not find every value, the server (`/api/read`) asks Gemini to read the question (text and/or photo) into numbers. Rule-found values always win. Gemini never solves or draws. Set `GEMINI_API_KEY` (free key from Google AI Studio) to turn it on; leave it empty to run with no AI at all.
3. **Confirm screen**: the student sees the numbers and can fix any OCR mistake. This is the safety net.
4. **Solver** (`src/lib/solver.ts`, runs on the server at `/api/solve`) does the exact maths and builds the steps and the final sheet. Same input always gives the same, correct answer.
5. **Step player** draws each step (SVG), says which tool to use and why. **Sheet** = A3 preview, PDF download, Save.

## Run it (Antigravity, VS Code or any terminal)

```bash
npm install
cp .env.example .env.local      # then fill in the keys
npm run dev                     # http://localhost:3000
npm test                        # solver + parser self-tests
```

- **Clerk**: create an application at clerk.com, copy the publishable and secret keys into `.env.local`. Turn on Google / email sign-in there.
- **Supabase (optional)**: create a project, run `supabase/schema.sql` in the SQL editor, put `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Without it, "Save" keeps sheets on the student's phone.

## Deploy for your 100 students

Push to GitHub → import on Vercel → add the same env vars → deploy. Free tiers of Vercel, Clerk and Supabase are enough for ~100 users.

## Install on a phone

Open the Vercel link in Chrome (Android) → menu → **Install app**. On iPhone use Safari → Share → **Add to Home Screen**. For a Play Store app later, wrap this same site with Capacitor or a Trusted Web Activity.

## Limits to know

- OCR works best on printed text or neat writing in good light. The Confirm screen exists for the rest.
- The first photo scan downloads OCR language data (a few MB) and needs internet.
- Only line projections for now. Add points, planes, solids as new files next to `solver.ts` using the same step format.
- Have an ED lecturer check the steps against your textbook before students rely on it.

## Files

- `src/lib/solver.ts` maths + steps · `parser.ts` question reader · `presets.ts` ready/random questions · `mistakes.ts` mistake list
- `src/components/Workspace.tsx` all screens · `Prims.tsx` drawing renderer
- `src/app/api/solve` and `src/app/api/sheets` backend · `src/middleware.ts` Clerk protection
- `public/manifest.webmanifest` + `sw.js` PWA

## v2: Sheets 1 to 3 (all questions built in)
- **Sheets tab** lists every question from Sheet 1 (types of lines), Sheet 2 (points A–G, Q7, lines A1–B3) and Sheet 3 (C1–C3, Q2–Q6) with step-by-step drawings, arrows, A3 sheet, PDF and common mistakes. Tick marks show what you finished.
- Scanning or typing one of these questions opens the matching solved question (words + all numbers must agree). Any other line question still goes through the generic line solver.
- Code: `src/lib/catalog.ts` (all questions), `points.ts`, `derived.ts`, `sheet1.ts`, `videos.ts`.
- **Videos**: the button opens YouTube search links. To play a video you trust inside the app, put its 11-character id in `src/lib/videos.ts` (`id: '...'`).
- Assumptions to check with your lecturer: Sheet 3 Q1 (C1–C3) lines are 75 mm like X(a) Q1; Sheet 1 uses an original figure with the standard BIS line types.
- Preview renders: `npx tsx scripts/render.tsx <folder>` writes SVGs. Tests: `npx tsx scripts/selftest.ts`.

## v3: cat theme + deploy on Netlify
- Pixel the cat explains every step in a speech bubble (SVG + CSS animation: blink, tail wag, ear twitch, paw wave, hop on the final sheet).
- Each step shows: **What I added** (every line, arc, point with its length), **Length / calculation**, and step 1 shows **How we crack this question**.
- Deploy: push this folder to GitHub, then Netlify > Add new site > Import from Git. `netlify.toml` is included (Next.js plugin).
  Set environment variables: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in, NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up, and optionally SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY.
  In Clerk, add your Netlify domain to the allowed domains.

## v4: live animated lessons, sidebar, full A3 sheets
- **Animated lesson** (Player.tsx): every question is replayed live with a ruler, pencil and compass, a cat narrator, a play/pause/scrub timeline, 0.5× to 2× speed, optional cat voice, a step checklist and the working for each step. This is the built-in video, so no YouTube link is needed.
- **Sidebar**: sheets, parts and questions with ticks, progress ring and a Scan → Check → Steps → Sheet flow. On phones it opens from the menu button.
- **Full A3 sheets** (FullSheet.tsx, fullsheet.ts): each part of a sheet is laid out like a real submission page with margins, labelled questions at one scale and a title block (name, roll no.). PDF download per page.
- **How it works** screen explains how questions were added; each question's "setup" line lives in `catalog.ts` (SETUPS and the `line()` helper).
- Preview tools: `scripts/harness.tsx` (bundle with esbuild to watch the player), `scripts/pages.tsx` (render A3 pages).

## v5: game layer and practice
- **XP, levels, streak, 9 badges** (game.ts): +30 finish a question, +15 new numbers, +10 quiz, +5 placed point. The cat grows glasses, a graduation cap, a scarf and a crown. Progress is stored on the device.
- **Your turn** (Challenge.tsx): tap where the next point goes; the cat checks the exact position (5 mm tolerance).
- **Cat quiz** (quiz.ts): 1 to 3 questions made automatically from each solution's results and steps.
- **Try new numbers** (catalog.ts `variantOf`): same kind of line question, fresh numbers, drawn by the same solver.
- **Sounds** (sfx.ts): synthesised in the browser, mute button in the header.

## Live deployment
- Site: https://ed-cat.netlify.app (Netlify site "ed-cat", deployed from this folder)
- Clerk app "ED Cat" (development instance), Supabase project "ed-cat" (ref pftqyihswtudnfhalmxf, Mumbai)
- All settings are in `.env.local` (keep it private; it contains the Clerk secret key and the function token).
- Redeploy: `npm i && npx netlify deploy --prod` (or push to Git and connect the repo in Netlify).
- Before real students use it: in Clerk, switch the app to production and add your domain; for Netlify, add the same variables.

## YouTube lectures
Set `YOUTUBE_API_KEY` (YouTube Data API v3). Each question then shows real lecture videos that play inside the app (`/api/videos`, cached 7 days, about 100 quota units per new search of the 10,000 free per day).
To avoid using quota at all, run once: `YOUTUBE_API_KEY=xxx npx tsx scripts/fetch-videos.ts`, check `src/lib/pinned.json`, delete videos you dislike, and redeploy. Pinned videos are shown first.
