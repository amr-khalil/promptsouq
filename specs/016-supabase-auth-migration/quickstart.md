# Quickstart: Supabase Auth Migration

**Feature**: 016-supabase-auth-migration
**Date**: 2026-02-18

## Prerequisites

1. Supabase project `dyaflmsawxpqgmyojtbc` has Auth enabled (already active)
2. Google OAuth credentials configured in Supabase Dashboard > Authentication > Providers
3. Facebook OAuth credentials configured in Supabase Dashboard > Authentication > Providers
4. OAuth redirect URI in both providers set to: `https://dyaflmsawxpqgmyojtbc.supabase.co/auth/v1/callback`

## Environment Setup

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://dyaflmsawxpqgmyojtbc.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<from-supabase-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-dashboard>
```

Remove from `.env.local` after migration:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
```

## Installation

```bash
npm install @supabase/ssr
# @supabase/supabase-js already installed (2.96.0)
```

After migration:
```bash
npm uninstall @clerk/nextjs
```

## File Structure (new/modified)

```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client (new)
│   │   ├── server.ts          # Server client (new)
│   │   ├── admin.ts           # Admin client with service role (new)
│   │   └── middleware.ts       # Session refresh helper (new)
│   ├── auth.ts                 # Rewritten: checkAuth, checkAdmin, getAuthUser
│   └── supabase-storage.ts    # Unchanged
├── hooks/
│   └── use-auth.ts            # New: replaces useUser/useAuth/useClerk
├── db/
│   └── schema/
│       └── profiles.ts        # New: Drizzle schema for profiles table
├── proxy.ts                    # Rewritten: Supabase session + locale middleware
├── app/
│   ├── layout.tsx              # Modified: remove ClerkProvider
│   ├── auth/
│   │   ├── callback/route.ts   # New: OAuth PKCE code exchange
│   │   └── confirm/route.ts    # New: email/recovery token verification
│   ├── [locale]/
│   │   ├── (auth)/
│   │   │   ├── sign-in/page.tsx          # Rewritten: Supabase signInWithPassword/OAuth
│   │   │   ├── sign-up/page.tsx          # Rewritten: Supabase signUp/OAuth
│   │   │   ├── reset-password/page.tsx   # New: enter new password after recovery
│   │   │   └── forgot-password/page.tsx  # New: request password reset email
│   │   └── (dashboard)/
│   │       └── dashboard/
│   │           ├── page.tsx              # Modified: use useAuth hook
│   │           ├── settings/page.tsx     # Modified: use profile API + Supabase storage
│   │           ├── onboarding/page.tsx   # New: multi-step onboarding wizard
│   │           └── admin/
│   │               └── users/page.tsx    # New: admin user management page
│   └── api/
│       ├── auth/sign-out/route.ts        # New: server-side sign-out
│       ├── user/profile/route.ts         # New: GET/PUT user profile
│       └── admin/users/
│           ├── route.ts                  # New: GET user list (admin)
│           └── [id]/role/route.ts        # New: PUT user role (admin)
├── components/
│   ├── Header.tsx              # Modified: replace Clerk hooks with useAuth
│   └── dashboard/
│       └── DashboardNavUser.tsx # Modified: replace Clerk hooks with useAuth
└── types/
    └── clerk.d.ts              # Deleted: no longer needed
```

## Database Setup

1. Create `profiles` table and trigger via Supabase migration
2. Add RLS policies for profiles table
3. Define Drizzle schema for type inference

## Supabase Dashboard Configuration

1. **Authentication > Email Templates**: Update confirmation and recovery URLs
2. **Authentication > Providers**: Enable Google and Facebook
3. **Authentication > URL Configuration**: Set Site URL and redirect URLs

## Verification

After each phase:
```bash
npm run lint && npm run build
```

Full verification:
1. Sign up with email/password → verify email → access dashboard
2. Sign in with Google → access dashboard
3. Sign in with Facebook → access dashboard
4. Forgot password → reset → sign in with new password
5. Update profile name and avatar in settings
6. Access admin pages with admin role
7. Promote/demote user from admin panel
8. Complete onboarding wizard
9. Verify all 33+ API routes return correct responses
10. Verify route protection on `/dashboard` when signed out
