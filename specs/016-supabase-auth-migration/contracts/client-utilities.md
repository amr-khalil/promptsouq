# API Contracts: Supabase Client Utilities

**Feature**: 016-supabase-auth-migration
**Date**: 2026-02-18

These are the internal utility functions that replace Clerk hooks/helpers throughout the codebase.

---

## Browser Client — `src/lib/supabase/client.ts`

```typescript
export function createClient(): SupabaseClient
```

**Usage**: Client Components (`"use client"`).
**Auth**: Reads/writes cookies automatically via browser cookie API.
**Environment**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

---

## Server Client — `src/lib/supabase/server.ts`

```typescript
export async function createClient(): Promise<SupabaseClient>
```

**Usage**: Server Components, Route Handlers.
**Auth**: Reads cookies from `next/headers`. Writes via try/catch (no-op in Server Components, works in Route Handlers).
**Environment**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

---

## Admin Client — `src/lib/supabase/admin.ts`

```typescript
export function createAdminClient(): SupabaseClient
```

**Usage**: Server-only operations requiring service role (user management, role assignment).
**Auth**: Uses service role key — bypasses RLS. Never import in client code.
**Environment**: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

---

## Middleware Helper — `src/lib/supabase/middleware.ts`

```typescript
export async function updateSession(request: NextRequest): Promise<NextResponse>
```

**Usage**: Called from `src/proxy.ts` middleware.
**Behavior**: Creates server client from request cookies, calls `getUser()` to refresh session, returns response with updated cookies.

---

## Auth Helpers — `src/lib/auth.ts` (replacement)

```typescript
// Get authenticated user ID (returns null if not authenticated)
export async function checkAuth(): Promise<string | null>

// Check admin role (returns { isAdmin, userId })
export async function checkAdmin(): Promise<{ isAdmin: boolean; userId: string | null }>

// Get full user profile (auth + profiles table)
export async function getAuthUser(): Promise<AuthUser | null>
```

**AuthUser type**:
```typescript
interface AuthUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  displayName: string | null
  avatarUrl: string | null
  role: 'admin' | 'user'
  onboardingCompleted: boolean
  emailVerified: boolean
  createdAt: string
  lastSignInAt: string
}
```

---

## Client-Side Auth Hook — `src/hooks/use-auth.ts`

Replaces `useUser()`, `useAuth()`, and `useClerk()` from Clerk.

```typescript
export function useAuth(): {
  user: AuthUser | null
  isLoaded: boolean
  isSignedIn: boolean
  signOut: () => Promise<void>
}
```

**Behavior**:
- Creates browser Supabase client
- Listens to `onAuthStateChange` for auth events
- Fetches profile from `/api/user/profile` when authenticated
- Exposes `signOut()` that calls `supabase.auth.signOut()` then redirects to `/`
- Returns `isLoaded: false` until initial auth check completes

---

## Environment Variables (new/changed)

```env
# Replace Clerk variables with:
NEXT_PUBLIC_SUPABASE_URL=https://dyaflmsawxpqgmyojtbc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Remove:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# CLERK_SECRET_KEY
# NEXT_PUBLIC_CLERK_SIGN_IN_URL
# NEXT_PUBLIC_CLERK_SIGN_UP_URL
# NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
# NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
```
