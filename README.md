# AI Resume Roaster

A simple Finlatics Project 2 app. Upload a text-based PDF resume and get a score, a lighthearted roast, and practical fixes on the same page. There is no sign-in, database, or saved history.

## Run locally

```bash
npm install
npm run dev
```

Open the `Local` URL printed by Next.js, usually [http://localhost:3000](http://localhost:3000). If port 3000 is occupied, Next.js may use [http://localhost:3001](http://localhost:3001). Keep the terminal running while you use the app. Stop it with Ctrl+C.

The app works without any environment variables. It uses simple local text checks to generate preview feedback. For AI-written feedback, copy `.env.example` to `.env.local`, set `GROQ_API_KEY`, and restart the dev server.

## How it works

The browser sends a PDF (maximum 5 MB) to `POST /api/roast`. The server checks the file, extracts text with `pdf-parse`, and returns feedback. When a Groq key is configured, `lib/llm.ts` requests JSON-mode output and validates it with Zod. Otherwise, `lib/local-roast.ts` produces clearly labeled preview feedback. The resume and result are not stored.

Image-only or empty PDFs cannot be reviewed. For a production check, run `npm run lint` and `npm run build`.
