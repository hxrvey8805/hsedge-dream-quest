## Goal
When a visitor joins the TradePeaks waitlist, instantly send them a branded, personalized welcome email from your domain explaining what to expect.

## Prerequisite: sender domain
No email domain is configured yet. The first implementation step opens a guided setup dialog where you choose the sender subdomain (e.g. `notify@tradepeaks.com`). One-time setup.

## What I'll build

**1. Add a name field to the waitlist form** (`src/pages/Index.tsx`)
- Optional "First name" input above the email field in both the inline waitlist and the hero email bar.
- Stored on `waitlist_signups` in a new nullable `first_name` column (schema migration).

**2. Email infrastructure** (automatic, one tool call)
- Sets up the email queue, send log, suppression handling, and unsubscribe token system.

**3. Welcome email template** — `waitlist-welcome`
- Subject: `You're on the TradePeaks waitlist`
- Personalized heading: `Welcome to the climb, {firstName}.` (falls back to `Welcome to the climb.` if no name).
- Dark hero band with tp-logo + cyan accent line, white body, three accent-bar feature rows (Early access invite / Behind-the-scenes drops / Zero noise), sign-off from "The TradePeaks team".
- Matches the email previewed above.

**4. Wire into the submit handler**
- After successful insert into `waitlist_signups`, invoke `send-transactional-email` with:
  - `templateName: 'waitlist-welcome'`
  - `recipientEmail: <their email>`
  - `templateData: { firstName: <their name or undefined> }`
  - `idempotencyKey: waitlist-welcome-<email>` so duplicate submits don't double-send.

**5. Unsubscribe page** at `/unsubscribe`
- Required so the system-appended unsubscribe link in the email works. Styled to match the landing page (dark, glass, cyan accent).

## What I will NOT do
- No marketing/bulk email capability — this is strictly the one welcome email triggered by their own signup.
- No changes to existing auth flows or auth emails.
- No additional fields beyond first name.

## After implementation
Domain DNS may still be verifying for a short while — emails will start flowing automatically once verification completes. You can monitor progress in Cloud → Emails.
