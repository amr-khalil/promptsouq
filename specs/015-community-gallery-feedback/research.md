# Research: Community Gallery & Feedback System

**Feature**: 015-community-gallery-feedback
**Date**: 2026-02-18

## R1: Masonry Grid Layout Approach

**Decision**: CSS columns (`column-count`) with responsive breakpoints via Tailwind

**Rationale**: CSS columns are the simplest pure-CSS masonry approach, requiring no JavaScript layout calculations. They handle varying image heights natively. The `break-inside: avoid` property prevents card splitting. Tailwind's responsive prefixes (`columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5`) make breakpoint configuration trivial. No additional dependency needed.

**Alternatives considered**:
- CSS Grid with `masonry` value — Not yet widely supported in browsers (Firefox only behind flag)
- `react-masonry-css` library — Adds dependency for something CSS handles natively
- JavaScript-based layout (Isotope/Masonry.js) — Heavy, requires ref-based DOM manipulation, conflicts with React's rendering model
- CSS Grid with `grid-auto-rows: 1px` + span calculation — Complex, requires knowing image dimensions upfront

## R2: Infinite Scroll Implementation

**Decision**: Intersection Observer API via a custom `useInfiniteScroll` hook

**Rationale**: The Intersection Observer API is native, performant (no scroll event listeners), and well-supported. A sentinel `<div>` at the bottom of the grid triggers the next page fetch when it enters the viewport. This aligns with the existing codebase pattern of custom hooks. No additional library needed.

**Alternatives considered**:
- `react-infinite-scroll-component` — Extra dependency, limited customization
- Scroll event + debounce — Less performant, requires manual threshold calculation
- `useSWRInfinite` — Would require adding SWR as a dependency; project uses plain `fetch`

## R3: Image Detail Modal

**Decision**: Reuse existing shadcn/ui `Dialog` component with custom fullscreen-like content

**Rationale**: The project already uses Radix UI Dialog via shadcn. The `DialogContent` can be styled for a wide layout (image left, info right). Keyboard accessibility (Escape to close, focus trap) comes built-in. Matches existing patterns in `PromptCard.tsx` preview modal.

**Alternatives considered**:
- Custom lightbox component — Reinvents accessibility features Dialog provides free
- Route-based modal (parallel route) — Over-engineered for this use case; URL-based modals add routing complexity

## R4: Gallery Image Storage

**Decision**: Reuse existing `prompt-images` Supabase Storage bucket

**Rationale**: The bucket already exists, is publicly accessible, and the upload API route (`POST /api/upload/image`) handles auth, validation, and Supabase Storage operations. Gallery images can use a different path prefix (e.g., `gallery/{userId}/{timestamp}-{uuid}.{ext}`) within the same bucket. No new bucket or storage configuration needed.

**Alternatives considered**:
- New `gallery-images` bucket — Unnecessary isolation; adds configuration overhead
- External CDN (Cloudinary, imgix) — Adds cost and dependency; Supabase Storage is sufficient

## R5: Notification Bell Architecture

**Decision**: Database-backed notifications table with polling (60-second interval)

**Rationale**: A simple `notifications` table with `read` boolean field. The header's `NotificationBell` component polls `GET /api/notifications/count` every 60 seconds for the unread count badge. Clicking opens a dropdown fetching the recent 20 notifications. This is simple, requires no WebSocket infrastructure, and matches the existing pattern of polling admin pending counts (5-minute interval).

**Alternatives considered**:
- Supabase Realtime (WebSocket) — Over-engineered for low-frequency events (gallery approvals happen at most a few per day)
- Server-Sent Events — Requires persistent connection; complicates serverless deployment
- Push notifications (web push API) — Complex setup (service worker, VAPID keys) for a simple in-app badge

## R6: Feature Request Voting - Optimistic Updates

**Decision**: Optimistic UI update with rollback on API failure

**Rationale**: When a user clicks the vote button, immediately update the UI (increment/decrement count, toggle button state) before the API call completes. If the API call fails, revert the state and show an error toast. This provides instant feedback and matches modern interaction patterns. The `POST/DELETE /api/feature-requests/[id]/vote` endpoints use a unique constraint (`user_id`, `feature_request_id`) to prevent double-voting at the database level.

**Alternatives considered**:
- Pessimistic update (wait for API) — Feels sluggish for a simple toggle action
- Local storage cache — Unnecessary complexity; server is source of truth

## R7: Issue Image Upload

**Decision**: Reuse existing `POST /api/upload/image` endpoint

**Rationale**: The existing image upload API handles auth, file validation (type + size), and Supabase Storage upload. Issue form will upload the image first via this endpoint, receive the URL, then include it in the issue submission payload. Same pattern used by the sell form for prompt images.

**Alternatives considered**:
- New dedicated upload endpoint — Duplicates existing functionality
- Inline base64 in issue submission — Bad for payload size and storage efficiency

## R8: Admin Issue Status Changes - Data Model

**Decision**: Separate `issue_status_changes` table (one row per status change) linked to the issue

**Rationale**: The spec requires "one resolution note per status change." A separate table preserves the full history of status transitions with timestamps and notes. The issue table stores only the current status for efficient querying. This supports showing a timeline of status changes to the user.

**Alternatives considered**:
- Single `admin_note` column on issues table — Loses history when status changes multiple times
- JSONB array column — Harder to query and index; doesn't follow the existing relational pattern

## R9: Feature Request Visibility and RLS

**Decision**: Gallery and feature requests are public routes (no auth required to browse). Issues dashboard requires auth. Admin routes require admin role.

**Rationale**: Per clarification Q1, feature requests are publicly browsable. Gallery is already specified as public. RLS policies will:
- `gallery_images` (status='approved'): anon SELECT
- `feature_requests`: anon SELECT
- `feature_votes`: authenticated INSERT/DELETE own rows
- `issues`: authenticated SELECT own rows only; admin SELECT all
- `notifications`: authenticated SELECT own rows only

**Alternatives considered**: N/A — directly from spec clarification.

## R10: Blurred Prompt Preview in Gallery Modal

**Decision**: CSS `filter: blur()` on a truncated prompt text element with overlay gradient

**Rationale**: Show the first ~100 characters of the prompt text with a CSS blur filter applied and a gradient overlay fading to the background. A "View Prompt" button overlays the blurred area. This is a pure CSS approach requiring no image generation or server-side processing. The actual prompt content is NOT sent to the client for paid prompts — only a server-generated preview snippet.

**Alternatives considered**:
- Server-side blurred image of text — Overcomplicated; adds image generation dependency
- Simply hiding prompt text — Loses the teaser effect that drives conversions
- Sending full prompt text and blurring client-side — Security risk; prompt text visible in network tab
