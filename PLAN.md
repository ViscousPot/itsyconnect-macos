# Backend implementation plan

Step-by-step plan for implementing the Itsyship backend. Each phase is self-contained, tested, and builds on the previous one. See `docs/BACKEND.md` for architecture and conventions.

## Current state

**Phases B0–B9 complete.** 77 tests passing.

- B0: Schema (users, ascCredentials, aiSettings, cacheEntries) + ULID generator + migration
- B1: Env validation (Zod, auto-generate keys)
- B2: Encryption (AES-256-GCM envelope encryption)
- B3: Auth (bcrypt, iron-session, rate limiter, CSRF, proxy)
- B4: Onboarding API (POST /api/setup, POST /api/setup/test-connection, GET /api/health)
- B5: Auth API (POST /api/auth login, DELETE /api/auth logout, GET /api/auth/me)
- B6: Settings API (credentials CRUD, AI GET/PUT, profile GET/PUT) + wired UI pages
- B7: Security headers (HSTS, CSP, X-Frame-Options, etc.) in next.config.ts
- B8: ASC client (JWT, token bucket, retry), cache module, /api/apps, /api/refresh
- B9: Background sync worker with deduplication

**Remaining:** B10 (wire dashboard pages to real API)

---

## Phase B0 – Database schema

**Goal:** Complete Drizzle schema matching `docs/BACKEND.md`. Generate migration. Verify with tests.

### Files

| File | Action |
|---|---|
| `src/db/schema.ts` | Rewrite – users, ascCredentials, aiSettings, all cache tables |
| `src/db/index.ts` | Update – add `PRAGMA synchronous = NORMAL`, export types |
| `tests/unit/db.test.ts` | Create – schema smoke test (create tables, insert, query) |

### Schema changes

- **`users`** – id (text, ULID), name, email (unique), passwordHash, role (admin/member), createdAt, updatedAt
- **`ascCredentials`** – id (text, ULID), issuerId, keyId, encryptedPrivateKey, iv, authTag, encryptedDek, isActive, createdAt. Remove `label`, `keyVersion`.
- **`aiSettings`** – id (text, ULID), provider, modelId, encryptedApiKey, iv, authTag, encryptedDek, updatedAt
- **`cacheEntries`** – single table instead of per-resource tables. Fields: resource (text, e.g. "apps", "versions:appId"), data (text, JSON), fetchedAt (integer, unix ms), ttlMs (integer). Primary key on `resource`. Simpler, no schema changes when adding new resource types.

### IDs

Use ULID strings (sortable, no coordination). Add `src/lib/ulid.ts` – tiny generator using `crypto.getRandomValues`, no external dep.

### Tests

- Create in-memory DB, run schema, insert a user, query it back
- Verify foreign keys, unique constraints, defaults

### Deliverable

`npm run db:generate` produces a migration. Tests pass.

---

## Phase B1 – Environment validation

**Goal:** App refuses to start with missing/invalid env vars. Type-safe config object.

### Files

| File | Action |
|---|---|
| `src/lib/env.ts` | Create – Zod schema for all env vars, validated at import time |
| `.env.example` | Update – new vars (remove AUTH_USERNAME, add AUTH_EMAIL as optional) |
| `tests/unit/env.test.ts` | Create – valid/invalid env var combinations |

### Env vars

```
ENCRYPTION_MASTER_KEY  – required, 64-char hex string
SESSION_SECRET         – required, 32+ chars
DATABASE_PATH          – optional, defaults to ./data/itsyship.db
AUTH_EMAIL             – optional, pre-seed admin
AUTH_PASSWORD           – optional, pre-seed admin
PORT                   – optional, default 3000
```

### Implementation

- Zod schema with `.parse(process.env)`
- Export typed `env` object
- Throws at import time if invalid – app won't start
- Generate `ENCRYPTION_MASTER_KEY` and `SESSION_SECRET` automatically on first run if not set (write to `.env.local` or print to stdout with instructions)

### Tests

- Valid env → parses
- Missing required → throws with clear message
- Invalid hex key → throws
- Optional vars use defaults

---

## Phase B2 – Encryption module

**Goal:** AES-256-GCM envelope encryption for secrets (ASC keys, AI API keys).

### Files

| File | Action |
|---|---|
| `src/lib/encryption.ts` | Create – encrypt/decrypt with envelope pattern |
| `tests/unit/encryption.test.ts` | Create – round-trip, tamper detection, wrong key |

### Implementation

- `encrypt(plaintext: string): EncryptedPayload` – generates random DEK, encrypts data with DEK, encrypts DEK with master key
- `decrypt(payload: EncryptedPayload): string` – decrypts DEK with master key, decrypts data with DEK
- `EncryptedPayload = { ciphertext: string, iv: string, authTag: string, encryptedDek: string }` – all base64
- Uses Node.js `crypto` module only, no external deps
- Master key from `env.ENCRYPTION_MASTER_KEY`

### Tests

- Round-trip: encrypt then decrypt returns original
- Different plaintexts produce different ciphertexts
- Tampered ciphertext throws
- Wrong master key throws
- Empty string encrypts/decrypts correctly

---

## Phase B3 – Auth infrastructure

**Goal:** Session middleware, password hashing, route protection.

### Files

| File | Action |
|---|---|
| `src/lib/auth.ts` | Create – hashPassword, verifyPassword (argon2), session config |
| `src/middleware.ts` | Create – iron-session check, redirect to /login or /setup |
| `src/lib/rate-limit.ts` | Create – in-memory sliding window rate limiter |
| `src/lib/csrf.ts` | Create – Origin header validation helper |
| `tests/unit/auth.test.ts` | Create – hash/verify, rate limiter |

### Session

- iron-session with `{ userId: string, role: string }` in cookie
- 7-day expiry, HttpOnly, Secure in production, SameSite=Lax
- Session config exported from `src/lib/auth.ts`

### Middleware

- Public paths: `/login`, `/setup`, `/api/health`, `/_next`, `/favicon`
- If no users in DB → redirect all non-public paths to `/setup`
- If not logged in → redirect to `/login`
- Otherwise → proceed

### Rate limiter

- `createRateLimiter(maxRequests: number, windowMs: number)`
- Returns `{ check(key: string): { allowed: boolean, retryAfter?: number } }`
- Sliding window counter in a `Map`, auto-cleanup of expired entries
- Two instances: `authLimiter` (5/min per IP), `apiLimiter` (60/min per user)

### CSRF

- `validateOrigin(request: Request): boolean` – checks Origin header matches
- Used in all mutation route handlers

### Password hashing

- Check if `argon2` is available (optional dep, C++ binding). If not, fall back to bcrypt.
- Actually: use `@node-rs/argon2` – pure Rust, no C++ build issues in Docker. If too heavy, use bcrypt from Node.js crypto (scrypt-based).
- Decision: use **bcrypt** via `bcryptjs` (pure JS, no native deps, works everywhere). Add dep.
- `hashPassword(plain: string): Promise<string>`
- `verifyPassword(plain: string, hash: string): Promise<boolean>`

### Tests

- Hash then verify → true
- Wrong password → false
- Rate limiter: allow up to limit, then reject, then allow after window expires
- CSRF: matching origin → true, different origin → false

---

## Phase B4 – Onboarding API

**Goal:** Wire up the setup wizard to real backend. First user creation, credential storage, AI config.

### Files

| File | Action |
|---|---|
| `src/app/api/setup/route.ts` | Create – POST: create admin user + credentials + AI settings |
| `src/app/api/setup/test-connection/route.ts` | Create – POST: test ASC credentials without saving |
| `src/app/api/health/route.ts` | Create – GET: health check + setup status |
| `src/app/setup/page.tsx` | Update – wire to real API calls instead of mock timeouts |
| `tests/unit/setup.test.ts` | Create – setup flow tests |

### POST /api/setup

Accepts: `{ name, email, password, issuerId?, keyId?, privateKey?, aiProvider?, aiModelId?, aiApiKey? }`

Flow:
1. Check no users exist (403 if users already exist)
2. Validate input with Zod
3. Hash password
4. Create user (role: admin)
5. If ASC credentials provided: encrypt private key, store
6. If AI settings provided: encrypt API key, store
7. Create session (auto-login)
8. Return `{ ok: true }`

### POST /api/setup/test-connection

Accepts: `{ issuerId, keyId, privateKey }`

Flow:
1. Check no users exist (only available during setup)
2. Generate JWT from credentials
3. Make test call to ASC API (list apps, limit 1)
4. Return `{ ok: true }` or `{ error: "..." }`

### GET /api/health

Returns: `{ status: "ok", setup: boolean }` – `setup: true` if no users exist yet.
Used by middleware to know whether to redirect to /setup.

### Tests

- Full setup flow: create user → verify in DB → verify session
- Setup when users exist → 403
- Invalid input → 400 with details
- ASC test connection (mocked)

---

## Phase B5 – Auth API

**Goal:** Login, logout, session check.

### Files

| File | Action |
|---|---|
| `src/app/api/auth/route.ts` | Create – POST (login), DELETE (logout) |
| `src/app/api/auth/me/route.ts` | Create – GET: current user info |
| `src/app/login/page.tsx` | Update – wire to real API |
| `src/components/layout/nav-footer.tsx` | Update – wire logout, show real user name/email |
| `tests/unit/auth-api.test.ts` | Create – login/logout/me tests |

### POST /api/auth (login)

Accepts: `{ email, password }`

Flow:
1. Rate limit check (5/min per IP)
2. Validate input
3. Find user by email
4. Verify password (constant-time comparison via bcrypt)
5. Create session
6. Return `{ ok: true, user: { id, name, email, role } }`
7. On failure: generic "Invalid credentials" (don't reveal if email exists)

### DELETE /api/auth (logout)

Flow:
1. Destroy session
2. Return `{ ok: true }`

### GET /api/auth/me

Flow:
1. Check session
2. Return user info (no password hash)
3. 401 if not authenticated

### Tests

- Login with correct creds → 200 + session cookie
- Login with wrong password → 401
- Login with non-existent email → 401 (same message)
- Rate limiting: 6th attempt → 429
- Logout → session destroyed
- /me with session → user info
- /me without session → 401

---

## Phase B6 – Settings API

**Goal:** CRUD for credentials, AI settings, profile.

### Files

| File | Action |
|---|---|
| `src/app/api/settings/credentials/route.ts` | Create – GET, POST, DELETE |
| `src/app/api/settings/credentials/test/route.ts` | Create – POST: test existing credentials |
| `src/app/api/settings/ai/route.ts` | Create – GET, PUT |
| `src/app/api/settings/profile/route.ts` | Create – GET, PUT |
| `src/app/dashboard/settings/page.tsx` | Update – wire to API |
| `src/app/dashboard/settings/ai/page.tsx` | Update – wire to API |
| `src/app/dashboard/settings/profile/page.tsx` | Update – wire to API |
| `tests/unit/settings.test.ts` | Create |

### Credentials

- GET: return issuerId, keyId, isActive, createdAt (never return private key)
- POST: validate + encrypt + store + test connection + deactivate old
- DELETE: remove credential

### AI

- GET: return provider, modelId, hasApiKey (boolean, never return actual key)
- PUT: validate + encrypt API key + store

### Profile

- GET: return name, email
- PUT: update name, email, optionally change password (requires current password)

---

## Phase B7 – Security headers + middleware hardening

**Goal:** Production-ready security.

### Files

| File | Action |
|---|---|
| `src/middleware.ts` | Update – add security headers, CSRF validation |
| `next.config.ts` | Update – security headers via config |
| `tests/unit/security.test.ts` | Create – header checks, CSRF validation |

### Headers

Add to all responses via `next.config.ts` headers config:
- Strict-Transport-Security
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin

CSP added carefully (Next.js needs `unsafe-inline` for styles).

### Middleware updates

- CSRF: validate Origin on all POST/PUT/PATCH/DELETE to /api/*
- Rate limiting integration in middleware (or per-route)

---

## Phase B8 – ASC API wrapper + caching

**Goal:** Connect to real App Store Connect API. Cache responses in SQLite.

### Files

| File | Action |
|---|---|
| `src/lib/asc/client.ts` | Create – JWT generation, authenticated fetch |
| `src/lib/asc/rate-limit.ts` | Create – token bucket for ASC API (5/sec) |
| `src/lib/cache.ts` | Create – generic cache read/write/invalidate using cacheEntries table |
| `src/lib/asc/apps.ts` | Create – list apps, get app |
| `src/lib/asc/versions.ts` | Create – list versions, localizations, update |
| `src/lib/asc/builds.ts` | Create – list builds, build detail |
| `src/app/api/apps/route.ts` | Create – GET: list apps (from cache) |
| `src/app/api/apps/[appId]/route.ts` | Create – GET: app detail |
| `src/app/api/apps/[appId]/versions/route.ts` | Create – GET, POST |
| `src/app/api/apps/[appId]/builds/route.ts` | Create – GET |
| `src/app/api/refresh/route.ts` | Create – POST: manual cache refresh |
| `tests/unit/cache.test.ts` | Create |
| `tests/unit/asc-client.test.ts` | Create (MSW mocked) |

### Cache implementation

- `cacheGet(resource: string): T | null` – returns parsed JSON if not stale, null if stale or missing
- `cacheSet(resource: string, data: T, ttlMs: number): void` – upsert into cacheEntries
- `cacheInvalidate(resource: string): void` – delete entry
- `cacheInvalidatePrefix(prefix: string): void` – delete all matching (e.g. "versions:app-123*")

### ASC client

- Decrypt credentials on-demand
- Generate JWT (ES256, 15 min lifetime)
- Token bucket rate limiter (5 req/sec)
- Retry with exponential backoff on 429
- All functions return typed responses

---

## Phase B9 – Background sync worker

**Goal:** Periodic background refresh of cached data.

### Files

| File | Action |
|---|---|
| `src/lib/sync/worker.ts` | Create – sync scheduler |
| `src/lib/sync/jobs.ts` | Create – per-resource sync functions |
| `src/app/api/sync/status/route.ts` | Create – GET: last sync times, next scheduled |
| `tests/unit/sync.test.ts` | Create |

### Implementation

- `startSyncWorker()` – called once on app startup
- Uses `setInterval` per resource type with configurable intervals
- Deduplication: `Map<string, Promise>` tracks in-flight fetches
- Graceful: if no ASC credentials configured, worker is dormant
- Sync on startup: immediate fetch for all resources if cache is empty

### Schedule

| Resource | Interval |
|---|---|
| Apps | 60 min |
| Versions | 15 min |
| Builds | 5 min |
| Reviews | 15 min |
| Analytics | 60 min |
| Sales | 60 min |

---

## Phase B10 – Wire up dashboard pages

**Goal:** Replace mock data in all dashboard pages with real API calls.

### Approach

- Create API routes for each page's data needs
- Replace `MOCK_*` imports with `fetch()` calls or server components
- Keep mock data files as fallbacks during development (feature flag or env var)
- Add loading states, error boundaries
- Add "updated X ago" staleness indicators
- Add refresh buttons that call `/api/refresh`

### Pages to wire (in order)

1. App switcher sidebar – fetch from `/api/apps`
2. Store listing – fetch localizations
3. Screenshots – fetch screenshot sets
4. App review – fetch review submission status
5. App details – fetch app metadata
6. TestFlight builds – fetch from cache
7. TestFlight groups – fetch groups + testers
8. TestFlight feedback – fetch feedback
9. Reviews – fetch customer reviews
10. Analytics – fetch analytics data
11. Sales – fetch sales data

---

## Execution order

```
B0 (schema) → B1 (env) → B2 (encryption) → B3 (auth infra)
    → B4 (onboarding API) → B5 (auth API) → B6 (settings API)
    → B7 (security headers)
    → B8 (ASC wrapper + cache) → B9 (sync worker) → B10 (wire pages)
```

Phases B0–B7 are the foundation. B8–B10 connect to the real ASC API. Each phase has its own tests. No phase ships without passing tests.
