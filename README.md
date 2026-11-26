# AI Resume Roaster

A full-stack Finlatics Project 2 app. Sign in with GitHub (or Google), upload a text-based PDF resume, and get a witty but useful review from Claude: an overall score, per-section scores with a roast and a fix for each, strengths, weaknesses, cringe phrases, and action items. Every roast is saved privately to your account so you can revisit or delete it later.

## Features

| Requirement | How it is implemented |
| --- | --- |
| PDF upload | Drag-and-drop or file picker (`components/upload-dropzone.tsx`). The browser and server both check type, extension, size (4 MB), and the `%PDF-` signature. |
| PDF text extraction | `pdf-parse` on the server (`lib/pdf.ts`). Scanned or image-only PDFs, near-empty files, and documents over 20,000 characters are rejected with a clear message instead of being silently cut off. |
| Claude API integration | `lib/llm.ts` calls Claude (`claude-opus-5-5`) through the official `@anthropic-ai/sdk` with structured outputs, so the response always matches the Zod schema in `lib/roast-schema.ts`. Refusals, truncation, rate limits, and API errors map to friendly messages. |
| User authentication | NextAuth.js with GitHub and optional Google OAuth (`lib/auth.ts`). `POST /api/roast` returns `401` without a session. Middleware redirects signed-out visitors away from `/history` and `/roast/*`. |
| Database persistence | Supabase Postgres (`supabase/migrations/`, `lib/db.ts`): `users`, `roasts` (user id, file name, extracted text, result JSON, score, created at), and `roast_attempts`. Users can list, open, and delete their own roasts. Every query is filtered by the signed-in user's id. |
| Rate limiting | 5 roasts per user per hour by default (`ROAST_LIMIT_PER_HOUR`). Enforced atomically in Postgres by `claim_roast_attempt`, so it holds across serverless instances. Returns `429` with a `Retry-After` header. |

If `ANTHROPIC_API_KEY` is missing, the app still works with clearly labeled local feedback from simple text checks (`lib/local-roast.ts`). If Supabase is missing, roasts are not saved and the rate limit falls back to a per-instance in-memory limit. Both fallbacks are for local development only.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page when signed out; upload and feedback when signed in. |
| `/signin` | Sign-in page listing the configured providers. |
| `/history` | Protected list of your past roasts. |
| `/roast/[id]` | Protected view of one saved roast. Only its owner can open it. |
| `POST /api/roast` | Authenticated upload: validate, extract text, rate limit, call Claude, save. Returns `{ result, mode, id, saved }`. |
| `DELETE /api/roasts/[id]` | Authenticated delete of one of your roasts. |
| `/api/auth/*` | NextAuth OAuth and session routes. |

API errors use `{ "error": { "code": "...", "message": "..." } }` with codes `UNAUTHORIZED` (401), `INVALID_FILE` (400/413/415/422), `RATE_LIMITED` (429), `AI_UNAVAILABLE` (502), and `SERVER_ERROR` (500/503).

## Local setup

Requires Node.js 18.17 or newer.

1. **Install:** `npm install`
2. **Environment:** copy `.env.example` to `.env.local` and fill it in. Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`.
3. **GitHub sign-in:** create an OAuth app at GitHub → Settings → Developer settings → OAuth Apps. Homepage URL `http://localhost:3000`, callback URL `http://localhost:3000/api/auth/callback/github`. Put its client ID and secret in `GITHUB_ID` and `GITHUB_SECRET`.
4. **Claude:** create an API key in the Claude Console and set `ANTHROPIC_API_KEY`.
5. **Supabase:** create a project, then run `supabase/migrations/20261126000000_init.sql` in the SQL editor (or `supabase db push` with the Supabase CLI). Copy the project URL and the service role key from Project Settings → API into `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
6. **Run:** `npm run dev` and open the `Local` URL that Next.js prints (usually http://localhost:3000).

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXTAUTH_URL` | Yes | Public origin of the app, such as `http://localhost:3000` or your Vercel URL. |
| `NEXTAUTH_SECRET` | Yes | Random secret used to sign session cookies. |
| `GITHUB_ID`, `GITHUB_SECRET` | Yes (or Google) | GitHub OAuth app credentials. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | No | Adds "Continue with Google". |
| `ANTHROPIC_API_KEY` | For AI feedback | Claude API key. Server-side only. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | For saving | Supabase project URL and service role key. Server-side only. |
| `ROAST_LIMIT_PER_HOUR` | No | Roasts per user per hour. Defaults to 5. |

Never commit `.env.local`. The service role key and Claude key are only read in server code; tables have row level security enabled with no public policies, so the anon key cannot read them.

## Deploy to Vercel

1. Import this repository into Vercel as a Next.js project.
2. Add every variable from the table above. Set `NEXTAUTH_URL` to the production URL, for example `https://your-app.vercel.app`.
3. Create a second GitHub OAuth app for production with the callback URL `https://your-app.vercel.app/api/auth/callback/github` (GitHub OAuth apps allow one callback URL each).
4. Apply the Supabase migration once before the first real use.
5. Deploy. The 4 MB upload limit stays under Vercel's 4.5 MB request body limit, so no extra settings are needed.

## GitHub Pages demo

[A browser-only demo](https://astaboyyye.github.io/fintask-resume-roaster/) is published from `docs/`. It reads the PDF in your browser and gives quick local feedback with no sign-in, Claude, or saving. The full app above is the real submission.

## Checks

```bash
npm run lint
npm run build
```

There is no unit-test framework. See [TUTORIAL.md](TUTORIAL.md) for a manual end-to-end check. Claude's output is validated for shape and score ranges, but its judgment still deserves a human read; it does not replace a recruiter or career adviser.
