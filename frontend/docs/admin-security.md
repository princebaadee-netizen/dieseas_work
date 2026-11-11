# Admin security requirements

The admin area in this frontend is a **placeholder**. The sign-in form, the
session and the guard all run in the browser against sample data. None of it
protects anything.

This list is what the **[BACKEND]** has to provide before the admin area can
be called secure. Every item here is a requirement, not a suggestion.

## 1. Authentication

| # | Requirement | Notes |
|---|---|---|
| 1.1 | Passwords are stored only as a slow salted hash (Argon2id or bcrypt). | Never plain text, never a plain hash. |
| 1.2 | The sign-in endpoint answers every failure with the same generic message and the same timing. | The page must not reveal whether an email exists. The current wording ("Those details did not match our records") is the target wording. |
| 1.3 | Repeated failures from one account are rate limited and eventually locked. | Return a generic message, never "too many attempts" for a valid account. |
| 1.4 | The session is a server-side session with an `HttpOnly`, `Secure`, `SameSite` cookie. | The token must not be readable from JavaScript. |
| 1.5 | The session expires after a period of inactivity and after an absolute maximum. | Both limits are enforced on the server. |
| 1.6 | Signing out invalidates the session on the server immediately. | Clearing a cookie in the browser is not enough. |
| 1.7 | The first administrator is created from an environment secret, not from a public form. | No open registration. |
| 1.8 | The sign-in form keeps `autocomplete="current-password"` and the browser may offer to save the password. | Saves the administrator time and is not a weakness. |

## 2. Authorisation

| # | Requirement | Notes |
|---|---|---|
| 2.1 | Every admin endpoint checks the session server-side. | Hiding a page in the frontend is not authorisation. |
| 2.2 | A signed-out request to an admin endpoint answers `401`. A signed-in request without the right role answers `403`. | The frontend can then send the browser to the sign-in page. |
| 2.3 | Editing is restricted to administrators. Reading published content does not require a session. | The public site must work with no session at all. |
| 2.4 | Every write records who made the change and when. | The audit trail needs the administrator's id, not just their name. |

## 3. Input and content safety

| # | Requirement | Notes |
|---|---|---|
| 3.1 | The server repeats **every** validation rule in `src/services/validation.ts`. | The frontend rules are for speed and guidance only. They are never the only check. |
| 3.2 | The server enforces the same length limits. | Name 120, short summary 300, description 2000, list item 300, remedy text 1500, source 300, category name 80, category description 400. |
| 3.3 | The server refuses content that breaks the no-dosage rule. | The rule lives in `containsDosage` in `src/services/validation.ts` and must be copied exactly. It is five named rules: a number with a dose unit, a dosing frequency, an interval in hours, a dose change instruction and the prescription abbreviations. `docs/backend-endpoints.md` lists them with examples. |
| 3.4 | The server generates slugs, not the browser. | The frontend slug preview is a convenience. The server's slug wins. |
| 3.5 | The server rejects a duplicate name for a disease or a category. | The frontend checks this too, but a race can only be settled on the server. |
| 3.6 | The server refuses to delete a category that still holds diseases. | The frontend disables the button; the server must still refuse. |
| 3.7 | Stored text is returned as text, never as markup. | The frontend renders everything as text content. The API must not return a field that the frontend is expected to inject as HTML. |

## 4. Data handling

| # | Requirement | Notes |
|---|---|---|
| 4.1 | The connection to the database uses a server-side secret that is never sent to the browser. | |
| 4.2 | The API base URL is set at build time and the production build never falls back to mock data. | `SETTINGS.useMockData` must be `false` in production. |
| 4.3 | Deletions are confirmed on the server and the response names what was removed. | The frontend relies on the message. |
| 4.4 | Backups are taken on a schedule and restoring one is tested. | Content is health information; losing it is the worst outcome. |

## 5. Transport and headers

| # | Requirement | Notes |
|---|---|---|
| 5.1 | The whole site is served over HTTPS. | No mixed content. |
| 5.2 | The server sends `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Strict-Transport-Security`. | A CSP that only allows the app's own scripts is the important one. |
| 5.3 | `X-Frame-Options: DENY` (or a CSP `frame-ancestors` rule) is set. | The admin area must not be framed. |
| 5.4 | The admin area is not cached by the browser or any proxy. | `Cache-Control: no-store` on admin responses. |

## 6. What the frontend already does

These are in place now and must be kept:

- A generic sign-in failure message (`src/services/adminService.ts`, `adminLogin`).
- No error message from the server reaches the page in a form that reveals internals.
- The guard redirects to the sign-in page (`src/components/admin/RequireAdmin.tsx`).
- The session is cleared on sign-out (`AdminAuthProvider`, `adminLogout`).
- Passwords are never stored, logged or written to storage.
- Every admin form validates on the client before it calls the service.
- The admin area is not linked from the public navigation.

## 7. Still open

- Whether administrators need more than one role. The plan says one, so the
  frontend assumes one role. Add a second role before the first real
  administrator is created, not after.
- How long a session should last. The frontend does not care; the backend
  must pick a number and enforce it.
- Whether administrators should be able to see who last changed a record.
  The audit trail needs the information to be stored first.
