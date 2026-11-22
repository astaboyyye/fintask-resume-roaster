# End-to-end walkthrough

1. Complete the environment and migration steps in [README.md](README.md).
2. Start the app with `npm run dev` and open `http://localhost:3000`.
3. Choose **Sign in with GitHub**. You should return to `/roast` after authorizing the OAuth app.
4. Upload a text-based PDF resume of 5 MB or less. The supplied sample resume can be used locally for this check. An empty, image-only, non-PDF, or oversized file should show a clear validation error.
5. Wait for the loading state to finish. The result page should show the overall score, summary, section feedback and fixes, strengths, weaknesses, cringe phrases, and action items.
6. Open `/history`, select the saved roast, and confirm it returns to the same result.
7. Sign out. Opening `/roast`, `/history`, or the result URL should take you to sign-in. A different user should not be able to view the result by guessing its URL.
8. Submit six valid PDFs within one hour as the same user. The sixth request should return HTTP 429 with a friendly rate-limit message. The limit counts attempts after successful PDF extraction, including attempts where Groq fails.

For a production check, run `npm run lint` and `npm run build`, then repeat the flow on your Vercel deployment. If you want the full 5 MB upload limit on Vercel, enable the large request body opt-in described in the README.
