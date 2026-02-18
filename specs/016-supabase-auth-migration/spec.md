# Feature Specification: Supabase Auth Migration

**Feature Branch**: `016-supabase-auth-migration`
**Created**: 2026-02-18
**Status**: Draft
**Input**: User description: "Migrate auth and profile and admin from Clerk to Supabase Auth — create account, login, and onboarding"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - New User Registration (Priority: P1)

A new visitor arrives at PromptSouq and wants to create an account. They can sign up using their email and password, or use a social login provider (Google or Facebook). After registering with email, they receive a verification email and must confirm their address before gaining full access. Once verified, they are redirected to the dashboard.

**Why this priority**: Account creation is the entry point for all authenticated features. Without registration, no other auth-dependent functionality works.

**Independent Test**: Can be fully tested by navigating to `/sign-up`, filling the form, receiving verification, and confirming the account is created in Supabase Auth. Delivers immediate value by enabling new user acquisition.

**Acceptance Scenarios**:

1. **Given** a visitor on the sign-up page, **When** they enter a valid email, password (min 8 characters), and accept terms, **Then** the system creates an account and sends a verification email.
2. **Given** a visitor on the sign-up page, **When** they click "Sign up with Google", **Then** they are redirected to Google OAuth, and upon consent, an account is created and they land on the dashboard.
3. **Given** a visitor on the sign-up page, **When** they click "Sign up with Facebook", **Then** they are redirected to Facebook OAuth, and upon consent, an account is created and they land on the dashboard.
4. **Given** a user who registered via email, **When** they click the verification link in their email, **Then** their account is marked as verified and they can access all authenticated features.
5. **Given** a visitor entering an email already in use, **When** they submit the sign-up form, **Then** they see an appropriate error message in Arabic.
6. **Given** a visitor entering a weak password, **When** they submit the form, **Then** they see a validation error explaining password requirements.

---

### User Story 2 - Existing User Login (Priority: P1)

A returning user wants to sign in to their account using email/password or social login. After successful authentication, they are redirected to the dashboard. If credentials are invalid, they see a clear Arabic error message.

**Why this priority**: Login is equally critical as registration — existing users must be able to access their accounts and data.

**Independent Test**: Can be tested by navigating to `/sign-in`, entering valid credentials, and verifying successful redirect to dashboard with correct user context.

**Acceptance Scenarios**:

1. **Given** a registered user on the sign-in page, **When** they enter correct email and password, **Then** they are authenticated and redirected to the dashboard.
2. **Given** a registered user, **When** they click "Sign in with Google" and authorize, **Then** they are authenticated and redirected to the dashboard.
3. **Given** a user entering incorrect credentials, **When** they submit the form, **Then** they see an Arabic error message without revealing whether the email exists.
4. **Given** an authenticated user navigating to `/sign-in`, **When** the page loads, **Then** they are automatically redirected to the dashboard.
5. **Given** an unverified email user, **When** they attempt to sign in, **Then** they are informed they need to verify their email first.

---

### User Story 3 - User Profile & Settings Management (Priority: P2)

An authenticated user wants to view and update their profile information — name, avatar, and other personal details — from the dashboard settings page. Changes persist immediately and are reflected across the application.

**Why this priority**: Profile management is a core user expectation after authentication is in place. Dashboard, header, and seller pages all display user data.

**Independent Test**: Can be tested by signing in, navigating to dashboard settings, updating name and avatar, and verifying changes appear in the header and profile page.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the settings page, **When** they update their first and last name and save, **Then** the changes are persisted and reflected in the header and dashboard.
2. **Given** an authenticated user, **When** they upload a new avatar image, **Then** the new image replaces the old one across all UI surfaces.
3. **Given** an authenticated user, **When** they view the dashboard profile page, **Then** they see their full name, email, join date, and last sign-in time.

---

### User Story 4 - Password Reset (Priority: P2)

A user who forgot their password can request a reset link from the sign-in page. They receive an email with a link that directs them to a dedicated `/reset-password` page where they set a new password and regain access.

**Why this priority**: Password recovery is essential for user retention and a standard authentication expectation.

**Independent Test**: Can be tested by clicking "Forgot password" on sign-in, entering email, clicking reset link, landing on `/reset-password`, setting new password, and signing in successfully.

**Acceptance Scenarios**:

1. **Given** a user on the sign-in page, **When** they click "Forgot password" and enter their email, **Then** they receive a password reset email.
2. **Given** a user with a reset link, **When** they click it, **Then** they land on the dedicated `/reset-password` page with a new-password form.
3. **Given** a user on the `/reset-password` page, **When** they enter a valid new password and confirm it, **Then** their password is updated and they are redirected to sign-in.
4. **Given** a user entering a non-existent email for reset, **When** they submit, **Then** they see a generic success message (to avoid email enumeration).
5. **Given** a user accessing `/reset-password` without a valid reset token, **When** the page loads, **Then** they see an error message and a link back to the sign-in page.

---

### User Story 5 - Admin Role & Access Control (Priority: P2)

Administrators retain their elevated access to moderation, order management, gallery review, analytics, and settings pages. Admin role is stored in server-managed auth metadata and checked on both client and server. Existing admins can promote or demote users via an admin panel UI in the admin dashboard.

**Why this priority**: The platform requires admin moderation for prompts, gallery, and issues. Without admin role migration, the admin dashboard is inaccessible.

**Independent Test**: Can be tested by signing in as an admin user, navigating to admin dashboard pages, verifying all admin API endpoints return data, and promoting/demoting a user via the admin panel.

**Acceptance Scenarios**:

1. **Given** a user with admin role, **When** they navigate to `/dashboard/admin/moderation`, **Then** they see the prompt moderation interface.
2. **Given** a regular user, **When** they attempt to access admin API endpoints, **Then** they receive a 403 Forbidden response.
3. **Given** an admin user, **When** they approve or reject a prompt, **Then** the action is recorded and the prompt status updates.
4. **Given** an admin user on the admin users page, **When** they promote a regular user to admin, **Then** the target user's role is updated and they gain admin access on next page load.
5. **Given** an admin user, **When** they demote another admin to regular user, **Then** the target user loses admin access on next page load.

---

### User Story 6 - Route Protection & Session Management (Priority: P2)

Protected routes (dashboard, checkout, seller pages) are only accessible to authenticated users. Unauthenticated visitors are redirected to the sign-in page. Sessions persist across browser tabs and survive page refreshes.

**Why this priority**: Route protection ensures data security and proper user experience. Without it, unauthenticated users could access protected pages.

**Independent Test**: Can be tested by accessing `/dashboard` without authentication and verifying redirect to `/sign-in`, then signing in and verifying access is granted.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they navigate to `/dashboard`, **Then** they are redirected to `/sign-in`.
2. **Given** an authenticated user, **When** they refresh the page, **Then** their session persists and they remain signed in.
3. **Given** an authenticated user, **When** they click sign out, **Then** their session is destroyed and they are redirected to the home page.
4. **Given** an authenticated user with a session open in multiple tabs, **When** they sign out in one tab, **Then** the other tabs reflect the signed-out state on next interaction.

---

### User Story 7 - Onboarding Wizard (Priority: P3)

After creating an account, a new user is guided through a 2-3 step onboarding wizard. Step 1: set display name and upload avatar. Step 2: brief feature highlights introducing browsing prompts, selling prompts, and using credits. The wizard is skippable at any step, and skipped users land directly on the dashboard.

**Why this priority**: Onboarding improves user activation and first-session engagement, but the platform is functional without it.

**Independent Test**: Can be tested by creating a new account and verifying the multi-step wizard appears, each step can be completed or skipped, profile data is saved, and the wizard does not reappear on subsequent logins.

**Acceptance Scenarios**:

1. **Given** a newly registered user, **When** they first sign in, **Then** they see Step 1 of the onboarding wizard (display name + avatar).
2. **Given** a user on Step 1, **When** they set their display name and avatar and click "Next", **Then** the information is saved to their profile and they advance to Step 2 (feature highlights).
3. **Given** a user on any wizard step, **When** they click "Skip", **Then** they proceed directly to the dashboard and the onboarding flag is marked as completed.
4. **Given** a user who completed or skipped onboarding, **When** they sign in again, **Then** the onboarding wizard does not reappear.

---

### Edge Cases
- How does the system handle OAuth provider account linking when a user signs up with email first, then tries Google login with the same email? Supabase Auth should automatically link accounts with matching verified emails.
- What happens when a user's session token expires mid-action (e.g., during checkout)? The system should refresh the session automatically or redirect to sign-in with a return URL preserving the user's context.
- What happens when the Supabase Auth service is temporarily unavailable? The system should display a user-friendly error message and allow retry.
- How are concurrent sessions handled (multiple devices)? Each device maintains its own session; signing out on one device does not affect others unless explicitly choosing "Sign out everywhere."

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create accounts using email and password with minimum 8-character passwords.
- **FR-002**: System MUST send email verification after email/password registration and restrict access until verified.
- **FR-003**: System MUST support OAuth sign-in/sign-up via Google and Facebook providers.
- **FR-004**: System MUST authenticate returning users via email/password or previously linked OAuth providers.
- **FR-005**: System MUST allow users to reset their password via email link.
- **FR-006**: System MUST maintain user sessions across page refreshes and browser tabs using secure cookies.
- **FR-007**: System MUST protect dashboard, checkout, seller, and admin routes — redirecting unauthenticated visitors to the sign-in page. Public auth routes include `/sign-in`, `/sign-up`, `/reset-password`, and `/auth/callback`.
- **FR-008**: System MUST support an admin role stored in user metadata, checked on both client and server for access control to admin pages and API endpoints.
- **FR-009**: System MUST allow authenticated users to update their display name and avatar from the settings page.
- **FR-010**: System MUST display the user's profile information (name, email, avatar, join date) in the dashboard and header.
- **FR-011**: System MUST sign users out and destroy their session when they click the sign-out button.
- **FR-012**: System MUST display all authentication error messages in Arabic (with English fallback based on locale).
- **FR-013**: System MUST validate all authentication inputs (email format, password strength, required fields) on both client and server.
- **FR-014**: System MUST provide a new-user onboarding flow for profile setup and feature discovery after first registration.
- **FR-015**: System MUST provide an admin panel UI where existing admins can promote regular users to admin or demote admins to regular users.
- **FR-016**: System MUST remove all Clerk dependencies from the codebase after migration is complete.
- **FR-017**: System MUST support the existing locale-based routing (`/ar/...` and `/en/...`) for all auth pages.

### Key Entities

- **User (Auth)**: Represents an authenticated identity managed by the auth system. Key attributes: unique ID, email, email verification status, auth provider (email/Google/Facebook), created date, last sign-in date.
- **User Profile**: A dedicated record auto-created on sign-up (via database trigger). Key attributes: user ID (references Auth user), display name, first name, last name, avatar URL, onboarding completed flag, locale preference, created date, updated date. This is the primary source for display data across the application.
- **Auth Metadata (role)**: Admin role stored in server-managed auth metadata (not user-editable). Key attributes: role (admin/user). Only modifiable via server/dashboard, not by the user themselves.
- **Session**: Represents an active authentication session. Key attributes: session token, user reference, expiry time, device/browser context.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account registration (email/password or OAuth) in under 2 minutes, excluding email verification wait time.
- **SC-002**: Users can sign in to their account in under 30 seconds.
- **SC-003**: All 33+ existing API endpoints that require authentication continue to function correctly with the new auth system.
- **SC-004**: Admin users retain access to all 6 admin dashboard pages and associated API endpoints without interruption.
- **SC-005**: Zero Clerk package dependencies remain in `package.json` after migration is complete.
- **SC-006**: Password reset flow completes successfully end-to-end within 5 minutes.
- **SC-007**: New user onboarding achieves at least 60% completion rate (users who start it finish it).
- **SC-008**: Protected routes redirect unauthenticated users to sign-in within 1 second.
- **SC-009**: Authentication error messages display correctly in both Arabic and English based on user locale.

## Clarifications

### Session 2026-02-18

- Q: Are there existing production users in Clerk that need migration? → A: No — development/test data only. Clean break, no user ID remapping needed. Story 8 removed.
- Q: Should user profile data be stored in a dedicated table or Auth metadata only? → A: Dedicated `profiles` table (auto-created on sign-up via trigger) + Auth metadata for role only.
- Q: What format should the onboarding flow take? → A: Multi-step wizard (2-3 steps) — Step 1: display name + avatar setup. Step 2: feature highlights (browse, sell, credits). Skippable at any step.
- Q: How should admin roles be assigned to users? → A: Admin panel UI — existing admins can promote/demote users from the admin dashboard.
- Q: Should password reset confirmation be a separate route or part of sign-in? → A: Dedicated `/reset-password` route — standalone page for entering new password.

## Assumptions

- Supabase Auth is already available on the existing Supabase project (`dyaflmsawxpqgmyojtbc`).
- Google and Facebook OAuth can be configured in the Supabase dashboard with the same provider credentials currently used for Clerk.
- No real production users exist in Clerk — this is a clean-break migration with no user ID remapping needed.
- Email delivery for verification and password reset will use Supabase's built-in email service (or a configured SMTP provider).
- The admin role will be stored in Supabase Auth's server-managed `app_metadata` (not user-editable), equivalent to Clerk's `publicMetadata`.
- A dedicated `profiles` table will be auto-created for each user on sign-up via a database trigger. Profile data (display name, avatar) lives in this table; auth metadata stores only the role.
- The `@supabase/supabase-js` client library is already partially installed (used for storage in feature 013).
- Session management will use Supabase Auth's cookie-based approach compatible with Next.js App Router and `@supabase/ssr`.

## Dependencies

- Supabase project must have Auth enabled with email/password and OAuth providers configured.
- Google and Facebook OAuth app credentials must be available for Supabase Auth configuration.
- SMTP configuration (if using custom email provider) must be set up in Supabase dashboard.
- This feature should be completed before any new features that add auth-dependent functionality, as it changes the core authentication layer.

## Out of Scope

- Two-factor authentication (2FA/MFA) — can be added in a future iteration after core migration is stable.
- Magic link (passwordless) authentication — may be considered as a future enhancement.
- Phone number authentication — not currently supported and not part of this migration.
- User account deletion / GDPR data export — separate feature.
- Migrating Clerk webhook integrations (if any) — will be addressed separately if needed.
