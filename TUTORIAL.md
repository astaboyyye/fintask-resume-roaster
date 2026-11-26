# Manual end-to-end check

Set up `.env.local` as described in the README, then run `npm run dev` and open the `Local` URL shown in the terminal (usually `http://localhost:3000`).

1. **Signed out:** the home page shows "Sign in to start". Opening `/history` redirects to `/signin`. Running `curl -X POST http://localhost:3000/api/roast` returns `401 UNAUTHORIZED`.
2. **Sign in** with GitHub. The header shows your name, **New roast**, **History**, and **Sign out**.
3. **Upload** a text-based PDF resume and select **Roast my resume**. Feedback labeled **Claude AI feedback** appears below the form, with a "Saved to your history" link.
4. **History:** open **History**. The roast is listed with its score. Open it, then try **Delete**.
5. **Validation:** try a non-PDF, a scanned or empty PDF, and a file over 4 MB. Each shows a specific error.
6. **Rate limit:** roast more than `ROAST_LIMIT_PER_HOUR` times (default 5) within an hour. The next attempt returns "You have reached the hourly roast limit".
7. **Privacy:** sign in with a different account and open the first account's `/roast/<id>` URL. It shows "Not found".
8. **Sign out** and confirm `/history` redirects to sign-in again.

Without `ANTHROPIC_API_KEY`, step 3 shows **Quick local feedback** instead. Without Supabase, roasts are not saved and History says saving is not configured.
