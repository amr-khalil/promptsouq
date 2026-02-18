# Tasks: Community Gallery & Feedback System

**Input**: Design documents from `/specs/015-community-gallery-feedback/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Not explicitly requested in spec. Omitted per template rules.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create all database tables, migrations, RLS policies, i18n files, and route configuration shared across all user stories.

- [X] T001 [P] Create gallery_images Drizzle schema in `src/db/schema/gallery-images.ts` per data-model.md (uuid PK, prompt_id FK, seller_id, image_url, caption, status, rejection_reason, reviewed_by, reviewed_at, likes_count, created_at with indexes on status, seller_id, prompt_id, created_at)
- [X] T002 [P] Create gallery_likes Drizzle schema in `src/db/schema/gallery-likes.ts` per data-model.md (serial PK, gallery_image_id FK with CASCADE, user_id, created_at, unique constraint on user_id+gallery_image_id)
- [X] T003 [P] Create feature_requests Drizzle schema in `src/db/schema/feature-requests.ts` per data-model.md (uuid PK, title, description, author_id, author_name, vote_count, status default 'open', created_at with indexes on vote_count DESC, created_at DESC, status)
- [X] T004 [P] Create feature_votes Drizzle schema in `src/db/schema/feature-votes.ts` per data-model.md (serial PK, feature_request_id FK with CASCADE, user_id, created_at, unique constraint on user_id+feature_request_id)
- [X] T005 [P] Create issues Drizzle schema in `src/db/schema/issues.ts` per data-model.md (uuid PK, title, description, image_url nullable, reporter_id, reporter_name, status default 'open', created_at, updated_at with indexes on reporter_id, status, created_at DESC)
- [X] T006 [P] Create issue_status_changes Drizzle schema in `src/db/schema/issue-status-changes.ts` per data-model.md (serial PK, issue_id FK with CASCADE, from_status, to_status, note, changed_by, created_at with index on issue_id)
- [X] T007 [P] Create notifications Drizzle schema in `src/db/schema/notifications.ts` per data-model.md (uuid PK, user_id, type, title, message, link nullable, read default false, created_at with indexes on user_id+read and user_id+created_at DESC)
- [X] T008 Update barrel export in `src/db/schema/index.ts` to add all 7 new table exports (galleryImages, galleryLikes, featureRequests, featureVotes, issues, issueStatusChanges, notifications)
- [X] T009 Generate and apply Drizzle migrations by running `npx drizzle-kit generate && npx drizzle-kit migrate` to create all 7 new tables in Supabase Postgres
- [X] T010 Apply RLS policies via Supabase MCP `apply_migration` for all 7 tables per data-model.md RLS section: gallery_images (anon SELECT approved, auth SELECT approved+own, auth INSERT own, admin all), gallery_likes (anon SELECT, auth INSERT/DELETE own), feature_requests (anon SELECT, auth INSERT own, admin UPDATE), feature_votes (auth SELECT/INSERT/DELETE own), issues (auth SELECT/INSERT own, admin SELECT/UPDATE all), issue_status_changes (auth SELECT via issue join, admin INSERT), notifications (auth SELECT/UPDATE own)
- [X] T011 Run `get_advisors(type: "security")` via Supabase MCP to verify no RLS gaps on new tables
- [X] T012 [P] Create gallery i18n translation files in `src/i18n/locales/ar/gallery.json` and `src/i18n/locales/en/gallery.json` with keys: page title, filters (today/week/month/all), categories, image detail labels (prompt, seller, likes, related), empty state, loading, like/unlike, view prompt CTA, blurred prompt text
- [X] T013 [P] Create feature-requests i18n translation files in `src/i18n/locales/ar/feature-requests.json` and `src/i18n/locales/en/feature-requests.json` with keys: page title, submit button, form labels (title/description), vote button, sort options (votes/newest), status labels, empty state, sign-in prompt
- [X] T014 [P] Create issues i18n translation files in `src/i18n/locales/ar/issues.json` and `src/i18n/locales/en/issues.json` with keys: page title, submit button, form labels (title/description/image), status labels (open/in_progress/resolved), my issues title, admin issues title, status change note label, confirmation messages, empty state
- [X] T015 [P] Update common translation files `src/i18n/locales/ar/common.json` and `src/i18n/locales/en/common.json` to add nav labels for Gallery ("المعرض"/"Gallery") and Feature Requests ("طلبات الميزات"/"Feature Requests") and Notifications ("الإشعارات"/"Notifications")
- [X] T016 [P] Update dashboard translation files `src/i18n/locales/ar/dashboard.json` and `src/i18n/locales/en/dashboard.json` to add sidebar labels for My Issues, Seller Gallery, Admin Issues, Admin Gallery Moderation
- [X] T017 Update public route matcher in `src/proxy.ts` to add `/gallery` and `/feature-requests` to the public routes array (no auth required to browse)

**Checkpoint**: All tables migrated, RLS applied, translations ready, routes configured. User story implementation can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Notification system infrastructure needed by US4 (issue status notifications) and US5 (gallery approval notifications). Must complete before those stories.

**CRITICAL**: US1, US2, and US3 can start in parallel with this phase. US4 and US5 must wait for this phase.

- [X] T018 [P] Create notification Zod schemas in `src/lib/schemas/notifications.ts` with: notificationListParams (limit, offset), markReadBody (action: 'read_one'|'read_all', notificationId optional uuid), notification response shape per contracts/notifications-api.md
- [X] T019 Implement GET /api/notifications/count API route in `src/app/api/notifications/count/route.ts` — requires Clerk auth via checkAuth(), queries notifications table for count where user_id matches and read=false, returns `{ unreadCount }` per contract
- [X] T020 Implement GET and PATCH /api/notifications API route in `src/app/api/notifications/route.ts` — GET: auth required, list user's notifications with limit/offset per contract; PATCH: validate markReadBody, update read=true for one notification or all user's notifications, return updated unreadCount per contract
- [X] T021 Create NotificationBell client component in `src/components/notifications/NotificationBell.tsx` — bell icon (Lucide Bell) with unread count badge, polls GET /api/notifications/count every 60 seconds, click opens NotificationDropdown. Use `"use client"` directive
- [X] T022 Create NotificationDropdown client component in `src/components/notifications/NotificationDropdown.tsx` — Popover showing recent 20 notifications fetched from GET /api/notifications, each with type icon, title, message, relative time, read/unread styling. "Mark all as read" button calls PATCH /api/notifications. Click notification navigates to its link and marks as read
- [X] T023 Add NotificationBell to Header in `src/components/Header.tsx` — insert after CartSheet for authenticated users only, before the divider separator. Wrap in Clerk SignedIn. Add to both desktop and mobile layouts

**Checkpoint**: Notification system ready. All user stories can now proceed.

---

## Phase 3: User Story 1 - Browse AI Image Gallery (Priority: P1) MVP

**Goal**: Public gallery page with Midjourney-style masonry grid, infinite scroll, time/category filters, skeleton loading.

**Independent Test**: Navigate to /gallery, verify masonry grid renders with images, apply filters, scroll to load more.

### Implementation for User Story 1

- [X] T024 [P] [US1] Create gallery Zod schemas in `src/lib/schemas/gallery.ts` with: galleryListParams (limit 1-50 default 20, cursor optional string, period enum today|week|month|all default all, category optional string), galleryUploadBody (imageUrl required url, promptId required uuid, caption optional max 500), galleryReviewBody (action enum approve|reject, rejectionReason optional string required if reject), gallery image response shapes per contracts/gallery-api.md
- [X] T025 [US1] Implement GET /api/gallery API route in `src/app/api/gallery/route.ts` — public (no auth), query gallery_images WHERE status='approved' joined with prompts (for title, isFree, category) and sellerProfiles (for name, avatar). Apply cursor-based pagination (WHERE created_at < cursor ORDER BY created_at DESC LIMIT limit+1 to detect hasMore). Apply period filter (today=24h, week=7d, month=30d) and category filter. Return response per gallery-api.md contract
- [X] T026 [P] [US1] Create GalleryFilters client component in `src/components/gallery/GalleryFilters.tsx` — row of filter chips/buttons for time period (Today, This Week, This Month, All Time) and category dropdown. Uses existing categories from /api/categories. Emits onChange callback with selected period and category. Mobile-first: horizontal scroll on mobile, inline on desktop. RTL-aware
- [X] T027 [P] [US1] Create GalleryImageCard client component in `src/components/gallery/GalleryImageCard.tsx` — renders single image in masonry grid with `break-inside: avoid`. Shows image with hover overlay (seller name, likes count). Uses ImageWithFallback pattern for error handling. onClick triggers modal open callback. Aspect ratio preserved naturally
- [X] T028 [US1] Create MasonryGrid client component in `src/components/gallery/MasonryGrid.tsx` — CSS columns layout (columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5). Renders array of GalleryImageCard. Implements infinite scroll via Intersection Observer on a sentinel div at bottom. Manages state: images array, loading, hasMore, cursor. Fetches from GET /api/gallery with cursor pagination. Shows Skeleton placeholders while loading. Shows empty state when no images. `"use client"` directive
- [X] T029 [US1] Create gallery page in `src/app/[locale]/gallery/page.tsx` — Server Component that renders page title, GalleryFilters, and MasonryGrid. Fetch initial batch of 20 images server-side and pass as props to MasonryGrid for SSR. Page metadata with Arabic title
- [X] T030 [P] [US1] Create gallery loading skeleton in `src/app/[locale]/gallery/loading.tsx` — skeleton masonry grid with 8-12 placeholder cards of varying heights using shadcn Skeleton component
- [X] T031 [US1] Add Gallery navigation link to Header in `src/components/Header.tsx` — add "المعرض" / "Gallery" link to desktop nav items and mobile menu, using i18n `t("nav.gallery")` from common namespace. Link to `/gallery` via LocaleLink

**Checkpoint**: Gallery page loads, displays masonry grid with images, filters work, infinite scroll loads more. US1 is independently functional.

---

## Phase 4: User Story 2 - View Image Detail with Prompt Info (Priority: P1)

**Goal**: Clicking a gallery image opens a detail modal showing full image, prompt info (free=full text, paid=blurred preview + purchase link), seller info, likes, related images.

**Independent Test**: Click any gallery image, verify modal shows correct info. Test with free prompt (full text visible) and paid prompt (blurred preview + CTA).

**Dependencies**: Requires US1 (gallery grid must exist for modal to trigger)

### Implementation for User Story 2

- [X] T032 [US2] Implement GET /api/gallery/[id] API route in `src/app/api/gallery/[id]/route.ts` — public (no auth but optionally reads auth for userHasLiked). Fetch gallery image with joined prompt data (id, title, titleEn, price, category, fullContent for free only, truncated ~100 char promptPreview for paid). Join sellerProfiles for seller info. Fetch related images (same category or seller, limit 6, exclude current). Return per gallery-api.md contract. CRITICAL: never send fullContent for paid prompts
- [X] T033 [US2] Implement POST and DELETE /api/gallery/[id]/like API route in `src/app/api/gallery/[id]/like/route.ts` — POST: auth required, insert into gallery_likes with unique constraint (409 if exists), increment gallery_images.likes_count, return { liked: true, likesCount }. DELETE: auth required, delete from gallery_likes (404 if not found), decrement likes_count, return { liked: false, likesCount }. Use transaction for atomic count update
- [X] T034 [US2] Create ImageDetailModal client component in `src/components/gallery/ImageDetailModal.tsx` — shadcn Dialog with wide layout. Left side: full-size image. Right side: seller avatar + name + rating, creation date, likes count with like toggle button (heart icon, optimistic update), prompt section (if free: full prompt text; if paid: blurred CSS filter text with gradient overlay + "عرض البرومبت" CTA button linking to /prompt/[id]), related images grid (clickable thumbnails that swap the current image). Keyboard accessible (Escape closes). Mobile: stacked layout (image top, info bottom). RTL-aware
- [X] T035 [US2] Wire ImageDetailModal into MasonryGrid in `src/components/gallery/MasonryGrid.tsx` — add selectedImageId state, pass onClick to GalleryImageCard that sets selectedImageId, render ImageDetailModal with open/close control. Fetch detail data from GET /api/gallery/[id] when modal opens. Handle related image click by updating selectedImageId

**Checkpoint**: Image detail modal works with free prompts (text visible), paid prompts (blurred + CTA), likes toggle, and related images. US2 complete.

---

## Phase 5: User Story 3 - Feature Request Submission & Voting (Priority: P2)

**Goal**: Public feature requests page with list, voting, submission form. Public read, auth to interact.

**Independent Test**: Browse feature requests without auth. Sign in, submit a request, vote/unvote, verify counts update.

**Dependencies**: None (independent of US1/US2)

### Implementation for User Story 3

- [X] T036 [P] [US3] Create feature-requests Zod schemas in `src/lib/schemas/feature-requests.ts` with: featureRequestListParams (sort enum votes|newest default votes, limit 1-50 default 20, offset default 0, status optional enum), createFeatureRequestBody (title required min 3 max 100, description required min 10 max 1000), response shapes per contracts/feature-requests-api.md
- [X] T037 [US3] Implement GET and POST /api/feature-requests API route in `src/app/api/feature-requests/route.ts` — GET: public, list feature_requests with sorting (votes: ORDER BY vote_count DESC; newest: ORDER BY created_at DESC), pagination (limit/offset), optional status filter. Optionally check auth to populate userHasVoted by left-joining feature_votes. Return { requests, total } per contract. POST: auth required via checkAuth(), validate createFeatureRequestBody, get user display name from Clerk currentUser(), insert row with author_id/author_name, return created request per contract
- [X] T038 [US3] Implement POST and DELETE /api/feature-requests/[id]/vote API route in `src/app/api/feature-requests/[id]/vote/route.ts` — POST: auth required, insert feature_vote with unique constraint (409 if exists), increment feature_requests.vote_count in transaction, return { voted: true, voteCount }. DELETE: auth required, delete vote (404 if not found), decrement vote_count in transaction, return { voted: false, voteCount }
- [X] T039 [P] [US3] Create VoteButton client component in `src/components/feature-requests/VoteButton.tsx` — upvote arrow icon (Lucide ArrowBigUp), vote count display, voted/not-voted visual states (filled vs outline). Optimistic toggle: immediately update UI, call POST or DELETE, rollback + toast.error on failure. Prompt sign-in if unauthenticated (use Clerk useAuth)
- [X] T040 [P] [US3] Create FeatureRequestCard client component in `src/components/feature-requests/FeatureRequestCard.tsx` — shadcn Card with VoteButton on the left (or right for RTL), title, description (truncated to 2 lines), author name, relative date, status badge. Mobile-first responsive layout
- [X] T041 [US3] Create FeatureRequestForm client component in `src/components/feature-requests/FeatureRequestForm.tsx` — shadcn Dialog triggered by "اقتراح ميزة" button. React Hook Form + zodResolver with createFeatureRequestBody schema. Title input + description textarea with character counters. Submit calls POST /api/feature-requests, shows toast.success on success, closes dialog and prepends new request to list. Arabic error messages from Zod schema
- [X] T042 [US3] Create FeatureRequestList client component in `src/components/feature-requests/FeatureRequestList.tsx` — manages state: requests array, total, sort, loading. Fetches from GET /api/feature-requests. Sort toggle (votes/newest). Renders FeatureRequestCard list. Pagination with "Load more" button or offset-based. Empty state when no requests. Includes FeatureRequestForm trigger button (hidden for unauthenticated)
- [X] T043 [US3] Create feature-requests page in `src/app/[locale]/feature-requests/page.tsx` — Server Component that renders page title and FeatureRequestList. Fetch initial data server-side
- [X] T044 [P] [US3] Create feature-requests loading skeleton in `src/app/[locale]/feature-requests/loading.tsx` — skeleton list with 5 placeholder cards using shadcn Skeleton
- [X] T045 [US3] Add Feature Requests navigation link to Header in `src/components/Header.tsx` — add "طلبات الميزات" / "Feature Requests" link to desktop nav (under Community section if exists) and mobile menu, using i18n `t("nav.featureRequests")`

**Checkpoint**: Feature requests page is publicly browsable, authenticated users can submit and vote, counts update correctly. US3 is independently functional.

---

## Phase 6: User Story 4 - Issue Reporting (Priority: P2)

**Goal**: Authenticated users can submit issues with optional image. Users see their own issues + admin status notes. Admin can manage all issues with status changes + resolution notes.

**Independent Test**: Submit an issue with image. View in My Issues list. Admin changes status with note. User sees updated status + note.

**Dependencies**: Requires Phase 2 (notification system for issue status change notifications)

### Implementation for User Story 4

- [X] T046 [P] [US4] Create issue Zod schemas in `src/lib/schemas/issues.ts` with: issueListParams (status optional enum open|in_progress|resolved, limit, offset), createIssueBody (title required min 5 max 200, description required min 10 max 2000, imageUrl optional url), adminIssueListParams (status, limit, offset, sort enum newest|oldest), changeIssueStatusBody (status required enum, note required min 5 max 1000), response shapes per contracts/issues-api.md
- [X] T047 [US4] Implement GET and POST /api/issues API route in `src/app/api/issues/route.ts` — GET: auth required, list issues WHERE reporter_id = userId with status filter, pagination, left join issue_status_changes for statusChanges array, ORDER BY created_at DESC. POST: auth required, validate createIssueBody, get user display name from Clerk, insert issue with reporter_id/reporter_name, return { id, title, status, message } per contract
- [X] T048 [US4] Implement GET /api/admin/issues API route in `src/app/api/admin/issues/route.ts` — admin auth required via checkAdmin(), list ALL issues with status filter, pagination, sort (newest/oldest), left join issue_status_changes, return { issues, total } per contract
- [X] T049 [US4] Implement PATCH /api/admin/issues/[id]/status API route in `src/app/api/admin/issues/[id]/status/route.ts` — admin auth required, validate changeIssueStatusBody, in transaction: (1) get current issue status, (2) insert issue_status_changes row with from_status/to_status/note/changed_by, (3) update issues.status and issues.updated_at, (4) insert notification for reporter (type: 'issue_status_changed', title/message in Arabic, link to /dashboard/issues). Return { id, status, message } per contract
- [X] T050 [P] [US4] Create IssueForm client component in `src/components/issues/IssueForm.tsx` — React Hook Form + zodResolver with createIssueBody. Title input, description textarea, optional image upload (reuse existing /api/upload/image endpoint with preview before submit). Submit calls POST /api/issues, shows toast.success, resets form. Arabic validation messages. 5MB file size limit enforced client-side
- [X] T051 [P] [US4] Create IssueList client component in `src/components/issues/IssueList.tsx` — fetches GET /api/issues for current user. Status filter tabs (All/Open/In Progress/Resolved). Each issue shows title, status badge, date, expandable to show description + image + status change history with admin notes timeline. Empty state when no issues
- [X] T052 [US4] Create AdminIssueTable client component in `src/components/issues/AdminIssueTable.tsx` — fetches GET /api/admin/issues. shadcn Table with columns: title, reporter, status, date. Status filter + sort controls. Click row to expand detail: description, image, status change history. Status change action: dropdown to select new status + required note textarea, calls PATCH /api/admin/issues/[id]/status, shows toast on success
- [X] T053 [US4] Create user issues dashboard page in `src/app/[locale]/dashboard/issues/page.tsx` — auth required (redirect if not signed in). Renders page title "البلاغات" and IssueForm + IssueList. Server Component shell with client components
- [X] T054 [P] [US4] Create user issues loading skeleton in `src/app/[locale]/dashboard/issues/loading.tsx` — skeleton form + skeleton list
- [X] T055 [US4] Create admin issues page in `src/app/[locale]/dashboard/admin/issues/page.tsx` — admin auth required (redirect if not admin). Renders page title and AdminIssueTable
- [X] T056 [P] [US4] Create admin issues loading skeleton in `src/app/[locale]/dashboard/admin/issues/loading.tsx` — skeleton table
- [X] T057 [US4] Add sidebar items for issues in dashboard layout `src/app/[locale]/dashboard/layout.tsx` — add "البلاغات" / "My Issues" link to user sidebar section (icon: AlertTriangle), add "إدارة البلاغات" / "Issues" link to admin sidebar section (icon: AlertCircle). Use i18n translations from dashboard namespace

**Checkpoint**: Users can submit issues with optional images, view their issues with status history. Admin can manage all issues with status changes + notes that create notifications. US4 is independently functional.

---

## Phase 7: User Story 5 - Gallery Image Submission by Sellers (Priority: P3)

**Goal**: Sellers upload images linked to their prompts. Admin moderates (approve/reject with reason). Notifications sent on approval/rejection.

**Independent Test**: Seller uploads image linked to prompt. Admin approves/rejects. Seller sees notification badge. Gallery shows approved image.

**Dependencies**: Requires Phase 2 (notifications), US1 (gallery display)

### Implementation for User Story 5

- [X] T058 [US5] Implement POST /api/gallery seller upload in `src/app/api/gallery/route.ts` — add POST handler: auth required, validate galleryUploadBody, verify seller owns the promptId (join prompts WHERE id=promptId AND seller_id=userId AND status='approved'), insert gallery_images with status='pending', return { id, status, message } per contract. Return 403 if not seller or prompt not owned
- [X] T059 [US5] Implement GET /api/admin/gallery API route in `src/app/api/admin/gallery/route.ts` — admin auth required, list gallery_images with status filter (default 'pending'), join prompts + sellerProfiles, pagination via limit/offset, return { images, total } per contract
- [X] T060 [US5] Implement POST /api/admin/gallery/[id]/review API route in `src/app/api/admin/gallery/[id]/review/route.ts` — admin auth required, validate galleryReviewBody, check image exists and status='pending' (409 if already reviewed). Update gallery_images: status=action, rejection_reason (if reject), reviewed_by=userId, reviewed_at=now(). Insert notification for seller: type='gallery_approved'|'gallery_rejected', Arabic title/message, link='/dashboard/seller/gallery'. Return { id, status, message }
- [X] T061 [US5] Create GalleryUploadForm client component in `src/components/gallery/GalleryUploadForm.tsx` — React Hook Form + zodResolver with galleryUploadBody. Image upload field (reuse /api/upload/image with preview), prompt selector dropdown (fetch seller's approved prompts from GET /api/seller/prompts?status=approved), optional caption textarea (max 500 chars). Submit calls POST /api/gallery, shows toast.success. Arabic labels and validation messages
- [X] T062 [US5] Create seller gallery submissions page in `src/app/[locale]/dashboard/seller/gallery/page.tsx` — auth required + seller check. Renders GalleryUploadForm + list of seller's gallery submissions fetched from GET /api/gallery with seller filter. Each submission shows image thumbnail, linked prompt title, status badge (pending/approved/rejected), rejection reason if rejected
- [X] T063 [P] [US5] Create seller gallery loading skeleton in `src/app/[locale]/dashboard/seller/gallery/loading.tsx` — skeleton form + skeleton submissions grid
- [X] T064 [US5] Create admin gallery moderation page in `src/app/[locale]/dashboard/admin/gallery/page.tsx` — admin auth required. Renders grid of pending gallery images fetched from GET /api/admin/gallery. Each image card shows thumbnail, seller name, linked prompt title, approve/reject buttons. Reject shows textarea for reason. Approve/reject calls POST /api/admin/gallery/[id]/review, shows toast, removes from pending list
- [X] T065 [P] [US5] Create admin gallery loading skeleton in `src/app/[locale]/dashboard/admin/gallery/loading.tsx` — skeleton grid
- [X] T066 [US5] Add sidebar items for gallery in dashboard layout `src/app/[locale]/dashboard/layout.tsx` — add "صور المعرض" / "Gallery Images" link to seller sidebar section (icon: Image), add "مراجعة الصور" / "Gallery Moderation" link to admin sidebar section (icon: ImageCheck). Use i18n translations

**Checkpoint**: Sellers can upload gallery images linked to prompts. Admin can approve/reject with notifications. Approved images appear in public gallery. US5 is complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, edge cases, and cross-cutting improvements.

- [X] T067 Handle edge case: prompt linked to gallery image deleted — in ImageDetailModal and GET /api/gallery/[id], when prompt is null or soft-deleted, show "البرومبت لم يعد متاحاً" ("Prompt no longer available") instead of prompt info/CTA
- [X] T068 Handle edge case: empty states — verify all list pages (gallery, feature requests, user issues, seller gallery, admin issues, admin gallery) show proper Arabic empty state messages with appropriate illustrations when no data exists
- [X] T069 Handle edge case: image load failures — in GalleryImageCard, use ImageWithFallback pattern to show placeholder on error, ensuring masonry layout stays intact with `break-inside: avoid`
- [X] T070 Run `npm run lint && npm run build` to verify zero errors across all new files. Fix any TypeScript, ESLint, or build errors before marking feature complete
- [X] T071 Run `get_advisors(type: "security")` via Supabase MCP for final RLS verification on all 7 new tables after all API routes are implemented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (T008 barrel export needed for notification schema queries)
- **US1 (Phase 3)**: Depends on Phase 1 only — can start in parallel with Phase 2
- **US2 (Phase 4)**: Depends on US1 (gallery grid must exist)
- **US3 (Phase 5)**: Depends on Phase 1 only — can start in parallel with Phase 2 and US1
- **US4 (Phase 6)**: Depends on Phase 2 (needs notification system for status change notifications)
- **US5 (Phase 7)**: Depends on Phase 2 (needs notifications) and US1 (images appear in gallery)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Phase 1 — No cross-story dependencies
- **US2 (P1)**: After US1 — Modal opens from gallery grid
- **US3 (P2)**: After Phase 1 — Fully independent of gallery stories
- **US4 (P2)**: After Phase 2 — Independent of gallery and feature requests
- **US5 (P3)**: After Phase 2 + US1 — Seller uploads feed the gallery, approval creates notifications

### Within Each User Story

- Zod schemas before API routes
- API routes before UI components
- Core components before page assembly
- Page creation before header/sidebar integration

### Parallel Opportunities

- T001-T007: All 7 schema files can be created in parallel
- T012-T016: All i18n files can be created in parallel
- T024+T026+T027+T030: US1 schemas, filters, card, and loading skeleton in parallel
- T036+T039+T040+T044: US3 schemas, vote button, card, and loading skeleton in parallel
- T046+T050+T051+T054+T056: US4 schemas, form, list, and loading skeletons in parallel
- T063+T065: US5 loading skeletons in parallel
- US1 and US3: Can proceed entirely in parallel after Phase 1
- US4 and US5: Can proceed in parallel after Phase 2

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all schema files together (different files, no dependencies):
Task: T001 "Create gallery_images schema in src/db/schema/gallery-images.ts"
Task: T002 "Create gallery_likes schema in src/db/schema/gallery-likes.ts"
Task: T003 "Create feature_requests schema in src/db/schema/feature-requests.ts"
Task: T004 "Create feature_votes schema in src/db/schema/feature-votes.ts"
Task: T005 "Create issues schema in src/db/schema/issues.ts"
Task: T006 "Create issue_status_changes schema in src/db/schema/issue-status-changes.ts"
Task: T007 "Create notifications schema in src/db/schema/notifications.ts"

# Then sequentially:
Task: T008 "Update barrel export" (needs all schema files)
Task: T009 "Generate and apply migrations" (needs barrel export)
Task: T010 "Apply RLS policies" (needs migrations applied)

# Launch all i18n files in parallel:
Task: T012, T013, T014, T015, T016 (all independent files)
```

## Parallel Example: US1 + US3 Concurrent

```bash
# After Phase 1, launch US1 and US3 in parallel:

# US1 track:
Task: T024 "Gallery Zod schemas"
Task: T025 "GET /api/gallery route" (needs T024)
Task: T026+T027+T030 "Filters, Card, Loading" (parallel, need T024 types)
Task: T028 "MasonryGrid" (needs T025+T027)
Task: T029 "Gallery page" (needs T028)

# US3 track (independent):
Task: T036 "Feature request Zod schemas"
Task: T037 "GET/POST /api/feature-requests" (needs T036)
Task: T038 "Vote API" (needs T036)
Task: T039+T040+T044 "VoteButton, Card, Loading" (parallel)
Task: T042 "FeatureRequestList" (needs T037+T040)
Task: T043 "Page" (needs T042)
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T001-T017)
2. Complete Phase 3: US1 - Browse Gallery (T024-T031)
3. **STOP and VALIDATE**: Gallery page loads with masonry grid, filters, infinite scroll
4. Deploy/demo — users can browse AI-generated images

### Incremental Delivery

1. Phase 1 → Setup ready
2. Phase 2 + US1 → Notification system + Gallery browsing (MVP!)
3. US2 → Image detail modal with prompt info + likes
4. US3 → Feature requests with voting (parallel with US2)
5. US4 → Issue reporting (parallel with US3)
6. US5 → Seller gallery upload + admin moderation
7. Phase 8 → Polish, edge cases, final verification

### Recommended Execution Path (Single Developer)

Phase 1 → Phase 2 → US1 → US2 → US3 → US4 → US5 → Phase 8

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All API routes use existing `checkAuth()` / `checkAdmin()` patterns from `src/lib/auth.ts`
- All API errors use existing `apiErrorResponse()` format
- All forms use React Hook Form + zodResolver per constitution
- All pages include co-located loading.tsx per constitution
- Denormalized counts (likes_count, vote_count) updated atomically in transactions
- Gallery uses cursor-based pagination (better for infinite scroll), feature requests use offset-based (better for "page N" display)
- Commit after each task or logical group
