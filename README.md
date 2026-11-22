# AI Resume Roaster

A full-stack Finlatics ANDP Project 2 application. Sign in with GitHub, upload a text-based PDF resume, and get a witty but constructive AI review. Each result has an overall score, section scores, strengths, weaknesses, awkward phrases, and specific action items. Your past roasts are saved privately to your account.

## Stack and architecture

- **Next.js 14 App Router + TypeScript** for pages and the multipart API route.
- **Tailwind CSS** for responsive, dark-mode-friendly UI.
- **NextAuth.js + Prisma adapter** for GitHub OAuth and database-backed sessions.
- **Prisma + Supabase Postgres** for users, sessions, saved roasts, and a database-backed per-user rate limit.
- **pdf-parse** for server-side text extraction. The browser and server both validate PDF type and size; the server also checks the PDF signature and extracted text.
- **Groq** for JSON-mode feedback. All provider calls are in `lib/llm.ts`; `lib/roast-schema.ts` validates responses with Zod and retries once if output is malformed.

The upload endpoint is `POST /api/roast`. It accepts a multipart `file` field, extracts and trims text, sends at most 16,000 characters to Groq, saves the result, and returns `{ "id": "..." }`. It never stores the original PDF. The extracted text **is** saved with the result in Postgres. Do not upload information you do not want stored. Requests are limited to five attempts per user per rolling hour; the limit is enforced atomically in Postgres and includes failed AI attempts after PDF validation.

## Local setup

1. Install Node.js 18.17 or newer and npm.
2. Create a Supabase project and copy its connection strings. Use the transaction pooler URL for `DATABASE_URL` and a direct or session pooler URL for `DIRECT_URL`.
3. Create a GitHub OAuth app. For local development, set its callback URL to `http://localhost:3000/api/auth/callback/github`.
4. Get a Groq API key.
5. Copy `.env.example` to `.env.local` and fill in the values. Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32` or another cryptographically secure generator.
6. Install dependencies, apply the migration, and start the app:

```bash
npm install
npm run db:deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use `npm run db:migrate` when changing the Prisma schema against a development database. Use `npm run db:deploy` to apply committed migrations in staging and production. `npm install` runs `prisma generate` through the `postinstall` script; `npm run build` compiles the app.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase transaction pooler URL for runtime queries (port 6543, `pgbouncer=true`). |
| `DIRECT_URL` | Supabase direct or session pooler URL (port 5432) for Prisma migrations. |
| `NEXTAUTH_URL` | Public app origin, such as `http://localhost:3000` locally or your production URL. |
| `NEXTAUTH_SECRET` | Random secret for NextAuth cookies and tokens. |
| `GITHUB_ID` | GitHub OAuth app client ID. |
| `GITHUB_SECRET` | GitHub OAuth app client secret. |
| `GROQ_API_KEY` | Groq API key; used server-side only. |
| `VERCEL_SUPPORT_LARGE_REQUEST_BODY` | Set to `1` on Vercel to accept the full 5 MB PDF limit; requires the 4 GB Performance memory setting. |

Never commit `.env.local` or copy secrets into client code. The `.gitignore` excludes environment files except `.env.example`.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page and sign-in call to action. |
| `/roast` | Protected PDF upload page with loading and error states. |
| `/roast/[id]` | Protected result page; only the owner can view a roast. |
| `/history` | Protected list of the signed-in user's past roasts. |
| `/api/auth/[...nextauth]` | NextAuth OAuth and session routes. |
| `POST /api/roast` | Authenticated PDF extraction, rate limiting, AI feedback, and persistence. |

API errors use `{ "error": { "code": "...", "message": "..." } }` with an appropriate HTTP status. The upload route runs in the Node.js runtime because `pdf-parse` requires Node APIs.

## Deploy to Vercel

1. Push this repository to a Git provider and import it into Vercel as a Next.js project.
2. Set all environment variables from the table in Vercel. Set `NEXTAUTH_URL` to the final production origin. Set the function memory to **4 GB Performance** and `VERCEL_SUPPORT_LARGE_REQUEST_BODY=1` to support uploads up to 5 MB. Without the opt-in, Vercel's default 4.5 MB request limit can reject a valid PDF before the app receives it.
3. Add `https://YOUR_DOMAIN/api/auth/callback/github` as the callback URL in a production GitHub OAuth app. GitHub OAuth apps have a single callback URL, so use separate apps for local and production if needed.
4. Run `npm run db:deploy` against the production Supabase database from a trusted machine or CI job before using the deployment. Do not rely on Vercel's build step to apply migrations.
5. Deploy. Vercel runs `npm install` (including Prisma Client generation) and `npm run build`.

The migration enables row-level security on all app tables without Data API policies. The app uses server-side Prisma with the Supabase database owner connection. Do not expose `DATABASE_URL`, `DIRECT_URL`, or the database owner password to browsers.

## Verification and limits

```bash
npm run lint
npm run build
```

The repository has no test framework, so there is no unit-test script. Live OAuth, Groq, and database flows require your own credentials and Supabase project. See [TUTORIAL.md](TUTORIAL.md) for a manual end-to-end check.

The AI output is checked for shape and score ranges; the model's factual judgment still needs human review. This tool does not replace a recruiter or career adviser.
