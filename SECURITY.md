# Security audit

Last reviewed: **2026-05-21**

## Summary

| Check | Status |
|-------|--------|
| API keys / secrets committed in source | **Pass** — keys use environment variables only |
| `.env` files in repository | **Pass** — none found; `.gitignore` excludes them |
| Git history scan for `sk-`, `ghp_`, `AKIA`, MongoDB URIs with credentials | **Pass** — no matches in tracked history |
| Hardcoded private keys / Bearer tokens | **Pass** |
| Agent access keys in repo | **Pass** — loaded via `EXPO_PUBLIC_*` (not hardcoded) |

## Findings (action recommended)

### Medium — infrastructure exposure

1. **DigitalOcean agent endpoint URLs** are committed in `mobile/src/services/agentService.ts`. Per DigitalOcean docs, endpoint URLs and agent IDs are not secret, but they identify your deployment. Rotate or restrict agents if the repo is public.

2. **Backend URL fallback** — default is now `http://localhost:3000`. For physical devices, set `EXPO_PUBLIC_BACKEND_URL` to your LAN IP in `mobile/.env` (do not commit device-specific IPs).

### High — application security (prototype gaps)

3. **Database API is unauthenticated** — `POST /action/*` (find, insert, update) has no auth. Anyone who can reach the backend can read/write all collections. Add JWT/session auth or API keys before any real deployment.

4. **Email-only login** — no password or OAuth. Suitable for demos only.

5. **`EXPO_PUBLIC_*` agent keys** — Expo inlines these into the mobile bundle. Treat as **public**; use a backend proxy for production.

6. **CORS** — `cors()` allows all origins on the backend.

7. **`docs.txt`** — vendor documentation only; no live secrets.

## Before going public

- [x] Removed hardcoded `10.205.1.208` fallback (use `EXPO_PUBLIC_BACKEND_URL` for devices)
- [ ] Add authentication to `/action/*` routes
- [ ] Proxy AI calls through the backend (never ship agent keys in the client)
- [ ] Enable MongoDB authentication and network restrictions
- [ ] Add rate limiting and HTTPS
- [ ] Run `git secrets` or [gitleaks](https://github.com/gitleaks/gitleaks) in CI

## Reporting

If you discover a vulnerability, open a private security advisory on GitHub or contact the maintainers directly. **Do not** file public issues for undisclosed security bugs.
