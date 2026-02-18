# Research: Supabase Auth Migration

**Feature**: 016-supabase-auth-migration
**Date**: 2026-02-18

## R1: Supabase Auth Client Architecture for Next.js App Router

**Decision**: Use `@supabase/ssr` with three separate client utilities (browser, server, middleware) in `src/lib/supabase/`.

**Rationale**: `@supabase/ssr` replaces the deprecated `@supabase/auth-helpers-nextjs`. It stores auth tokens in HTTP-only cookies (not localStorage) so they're available to Server Components, Route Handlers, and Middleware. Three clients are needed because each environment accesses cookies differently.

**Alternatives considered**:
- `@supabase/auth-helpers-nextjs` — deprecated, replaced by `@supabase/ssr`
- Single client utility — not viable because browser, server, and middleware require different cookie access patterns

**Key constraints**:
- MUST use `getAll`/`setAll` cookie methods only (not `get`/`set`/`remove`)
- Server Components can read but not write cookies — middleware handles token refresh persistence
- MUST call `supabase.auth.getUser()` for auth checks, not `getSession()` (session can be spoofed from cookies)

## R2: Middleware & Route Protection Strategy

**Decision**: Replace `clerkMiddleware` in `src/proxy.ts` with a Supabase `updateSession()` function that handles both token refresh and route protection, merged with the existing locale detection logic.

**Rationale**: The existing proxy already handles locale detection, redirects for authenticated users on auth pages, and route protection. Supabase middleware must refresh tokens on every request. Merging these into one middleware avoids double middleware overhead.

**Alternatives considered**:
- Separate `middleware.ts` for Supabase + keep `proxy.ts` for locale — Next.js only supports one middleware, would need composition
- Use Supabase only for auth, custom code for locale — this is what we'll do, but in one file

**Key pattern**: Middleware creates a Supabase client, calls `getUser()` (refreshes token), applies route protection rules, then handles locale detection — all returning a single response with both session cookies and locale cookies set.

## R3: OAuth Integration (Google + Facebook)

**Decision**: Use `supabase.auth.signInWithOAuth()` on the client with `redirectTo` pointing to `/auth/callback` route handler. The callback exchanges the PKCE code for a session.

**Rationale**: Supabase uses PKCE flow by default for server-side auth. OAuth providers redirect to `https://<project>.supabase.co/auth/v1/callback`, then Supabase redirects to our `redirectTo` URL with a `code` param.

**Alternatives considered**:
- Implicit flow — deprecated and less secure
- Direct provider token exchange — more complex, PKCE is the standard

**Setup required**: Google and Facebook credentials must be added to Supabase Dashboard > Authentication > Providers with redirect URI set to `https://dyaflmsawxpqgmyojtbc.supabase.co/auth/v1/callback`.

## R4: Admin Role Storage

**Decision**: Store admin role in `app_metadata.role` field. Use the Supabase Admin API (service role key) to set/modify roles. Access role via `user.app_metadata.role` on both server and client.

**Rationale**: `app_metadata` is server-only — users cannot modify it via `updateUser()`. This prevents privilege escalation. The `user_metadata` field is user-editable and inappropriate for security-critical data like roles.

**Alternatives considered**:
- Custom Access Token Hook + `user_roles` table — more complex, useful for fine-grained RBAC but overkill for a simple admin/user distinction
- `user_metadata` — insecure, users can edit it
- Separate roles table checked on every request — adds latency vs reading JWT

**Admin assignment**: An API route at `/api/admin/users/[id]/role` will accept PUT requests from admins, calling `supabaseAdmin.auth.admin.updateUser(id, { app_metadata: { role } })`.

## R5: Profiles Table & Auto-Creation Trigger

**Decision**: Create a `profiles` table in the `public` schema with a database trigger on `auth.users` INSERT that auto-creates a profile row.

**Rationale**: Separating profile data from auth metadata follows Supabase best practices. The trigger ensures every user always has a profile row, avoiding null checks throughout the app. Profile data supports RLS and relational joins.

**Table design**:
- `id` UUID (PK, references `auth.users.id` ON DELETE CASCADE)
- `first_name`, `last_name`, `display_name` (text)
- `avatar_url` (text)
- `onboarding_completed` (boolean, default false)
- `locale` (text, default 'ar')
- `created_at`, `updated_at` (timestamptz)

**Trigger function**: `security definer` with `set search_path = ''` for safety. Reads `raw_user_meta_data` for initial name/avatar from OAuth providers.

## R6: Email Verification & Password Reset Flows

**Decision**: Use Supabase's built-in email flows with custom route handlers:
- `/auth/confirm` — handles email verification (`type=email`) and password reset token verification (`type=recovery`)
- `/auth/callback` — handles OAuth PKCE code exchange
- `/reset-password` — client page where user enters new password after recovery token is verified

**Rationale**: Supabase sends emails with `token_hash` + `type` params. A single `/auth/confirm` route handler calls `verifyOtp()` to validate and establish a session, then redirects. For password reset, it redirects to `/reset-password` which calls `updateUser({ password })`.

**Email template URLs** (configured in Supabase Dashboard):
- Confirm Signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
- Reset Password: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`

## R7: Session Management

**Decision**: Use cookie-based sessions via `@supabase/ssr`. Sessions auto-refresh in middleware on every request. Sign-out calls `supabase.auth.signOut()` which clears cookies.

**Rationale**: Cookie-based sessions work across SSR/RSC without client-side token management. Middleware token refresh ensures sessions stay valid without client-side `onAuthStateChange` polling.

**Key behaviors**:
- Session persists across page refreshes (cookies)
- Session persists across tabs (shared cookies)
- Sign-out in one tab clears cookies; other tabs detect on next request
- Token refresh is transparent to the user

## R8: Existing Supabase Client Compatibility

**Decision**: Keep the existing `src/lib/supabase-storage.ts` service-role client for storage operations. Add three new auth-aware clients in `src/lib/supabase/`. The Drizzle ORM client in `src/db/index.ts` remains unchanged (uses direct Postgres connection, bypasses RLS).

**Rationale**: The storage client uses the service role key for server-side uploads (no user context needed). The new auth clients use the anon/publishable key with cookie-based sessions for user-facing operations. Drizzle bypasses Supabase entirely via direct Postgres connection.

**Alternatives considered**:
- Replace storage client with auth-aware client — would require RLS policies on storage, unnecessary complexity
- Use Supabase client for all DB access — would lose Drizzle ORM benefits (type safety, migrations)
