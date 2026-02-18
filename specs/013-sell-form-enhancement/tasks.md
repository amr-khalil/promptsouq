# Tasks: Sell Form Enhancement

**Input**: Design documents from `/specs/013-sell-form-enhancement/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/upload-image.md

**Tests**: Not explicitly requested in spec. Omitted from task phases.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create Supabase Storage bucket, configure server-side client

- [x] T001 Install `@supabase/supabase-js` via `npm install @supabase/supabase-js`
- [x] T002 Create Supabase Storage bucket `prompt-images` (public, 10 MB limit, JPEG/PNG/GIF/WebP) via Supabase MCP `execute_sql` using SQL from `specs/013-sell-form-enhancement/data-model.md` section "Supabase Storage Bucket"
- [x] T003 [P] Create server-side Supabase client for Storage operations in `src/lib/supabase-storage.ts` — use `createClient()` with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars. Export a `getStorageClient()` function. This file must never be imported from client components.
- [x] T004 [P] Add `uploadImageSchema` to `src/lib/schemas/api.ts` — Zod schema validating `file` field: `instanceof(File)`, max 10 MB, allowed MIME types (image/jpeg, image/png, image/gif, image/webp). See contract in `specs/013-sell-form-enhancement/contracts/upload-image.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Translation keys and shared utilities that all user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Add new translation keys to `src/i18n/locales/ar/sell.json` — add keys for: step labels (payment/details/content), payment badge (activated/warning), upload progress/errors (size limit, type error, network error, retry), inline success (title, viewPrompt, sellAnother), and any updated step navigation labels. Ensure all user-facing text is Arabic.
- [x] T006 [P] Add matching English translation keys to `src/i18n/locales/en/sell.json` — same key structure as T005 with English values.

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Conditional Payment-First Step Flow (Priority: P1) MVP

**Goal**: Reorder form steps to Payment (1) → Details (2) → Content (3). Sellers with activated payment skip to Step 2; sellers without activated payment must complete Step 1 first.

**Independent Test**: Sign in as a seller with/without Stripe Connect — verify correct starting step and step indicator state.

### Implementation for User Story 1

- [x] T007 [US1] Refactor step order and payment-first logic in `src/app/[locale]/sell/page.tsx` — (1) Fetch `/api/connect/status` on mount to get `isFullyOnboarded` boolean. (2) Change step order: Step 1 = PayoutStep, Step 2 = PromptDetailsStep, Step 3 = PromptFileStep. (3) Set `currentStep = paymentActivated ? 2 : 1`. (4) Store `paymentActivated` in state for use by child components. (5) Update `handleNext` to block advancement from Step 1 if not activated. (6) Remove the separate confirmation step (Step 4 for paid / Step 3 for free) — the confirmation will be replaced by inline success in US2. (7) For free prompts: skip Step 1 entirely, start at Step 2 (no payment needed). (8) Update field validation arrays (`step1Fields`, `step2Fields`) to match new step assignment. (9) Update `submitStep` and `confirmationStep` constants for the new 3-step flow.
- [x] T008 [US1] Update `src/components/sell/StepIndicator.tsx` — (1) Change step labels to: "Payment" / "Prompt Details" / "Content" (using i18n keys from T005). (2) Always show 3 steps (not 4). (3) When Step 1 is payment-activated: show a green CheckCircle icon (from Lucide) instead of the step number, and use a "completed" visual style (green background). (4) For free prompts: show only 2 steps (Details, Content) — omit payment step. (5) Props should accept `paymentActivated: boolean` and `isFree: boolean` to control display.
- [x] T009 [US1] Adapt `src/components/sell/PayoutStep.tsx` to work as Step 1 content — (1) The component already handles three states (no account, partial, fully onboarded). Ensure it receives a callback `onPaymentActivated` to notify the parent when onboarding completes. (2) Update the Stripe onboarding `refresh_url` from `/sell?step=3` to `/sell?step=1` (since this is now Step 1). (3) When the component detects `isFullyOnboarded` from the status check, call `onPaymentActivated()` which advances the parent to Step 2.
- [x] T010 [US1] Run `npm run lint && npm run build` and fix all errors introduced in T007–T009 before proceeding.

**Checkpoint**: Step reorder works — activated sellers skip to Step 2, non-activated sellers see Step 1 with payment setup. Free prompt flow unchanged (starts at Details).

---

## Phase 4: User Story 2 — Form Data Persistence Across Steps (Priority: P1)

**Goal**: Persist all form data in localStorage so drafts survive tab closes, browser restarts, and external redirects. Replace the current sessionStorage draft with localStorage. Add inline success state after submission.

**Independent Test**: Fill Step 2 fields, close the tab, reopen `/sell` — all fields should be restored at the correct step.

### Implementation for User Story 2

- [x] T011 [US2] Implement localStorage draft persistence in `src/app/[locale]/sell/page.tsx` — (1) Change storage key from `promptsouq-sell-draft` (sessionStorage) to `promptsouq-sell-draft` (localStorage). (2) Create `saveDraft(formData, currentStep, paymentActivated)` function that writes `SellFormDraft` JSON to localStorage (see data-model.md for schema). Include `savedAt` ISO timestamp. (3) Create `loadDraft(): SellFormDraft | null` function with try/catch for corrupt JSON — return null on failure. (4) Create `clearDraft()` function. (5) Call `saveDraft()` in `handleNext()` and `handleBack()` — saves current form values and step number on every navigation. (6) On page mount: call `loadDraft()`, if draft exists use `form.reset(draft.formData)` to restore values and set `currentStep` to `draft.currentStep`. (7) Remove the old sessionStorage-based `loadDraft`/`saveDraft`/`clearDraft` functions. (8) Handle graceful degradation: wrap localStorage calls in try/catch, log warning if unavailable.
- [x] T012 [US2] Create inline success component in `src/components/sell/InlineSuccess.tsx` — (1) "use client" component. (2) Display a success icon (PartyPopper from Lucide), a congratulatory title, and a description (all from i18n). (3) Two action buttons: "View Prompt" (links to `/prompt/{id}` using the newly submitted prompt ID) and "Sell Another" (calls `onSellAnother` callback). (4) Use shadcn Button components. (5) Accept props: `promptId: string`, `onSellAnother: () => void`. (6) Mobile-first layout, centered content.
- [x] T013 [US2] Integrate InlineSuccess into the sell page `src/app/[locale]/sell/page.tsx` — (1) Add `submittedPromptId: string | null` state. (2) After successful submission: set `submittedPromptId` to the returned prompt ID and call `clearDraft()`. (3) When `submittedPromptId` is set, render `<InlineSuccess>` instead of the Step 3 form content. (4) Implement `handleSellAnother`: set `submittedPromptId = null`, call `clearDraft()`, reset form to defaults, set `currentStep` based on payment status. (5) Remove the old `ConfirmationStep` rendering logic and step 4 references.
- [x] T014 [US2] Run `npm run lint && npm run build` and fix all errors introduced in T011–T013 before proceeding.

**Checkpoint**: Form data persists across step navigation, page refreshes, and tab closes. Inline success replaces the form after submission. "Sell Another" resets cleanly.

---

## Phase 5: User Story 3 — Direct Image Upload to Cloud Storage (Priority: P2)

**Goal**: Upload example images directly to Supabase Storage via an API route, replacing ephemeral blob URLs with permanent public URLs. Show upload progress and handle errors.

**Independent Test**: Upload an image on Step 3, refresh the page, verify the image still displays using a Supabase Storage URL.

### Implementation for User Story 3

- [x] T015 [P] [US3] Create image upload API route in `src/app/api/upload/image/route.ts` — (1) Export async `POST` handler. (2) Check Clerk auth via `auth()` — return 401 if not authenticated. (3) Extract file from `request.formData()` — get the `file` field. (4) Validate with `uploadImageSchema` from `src/lib/schemas/api.ts` — return 400 with flattened Zod errors on failure. (5) Generate storage path: `{userId}/{Date.now()}-{crypto.randomUUID().slice(0,8)}.{ext}` (extract ext from file type). (6) Convert File to ArrayBuffer then Buffer. (7) Upload to Supabase Storage bucket `prompt-images` via `getStorageClient()` from `src/lib/supabase-storage.ts`. (8) Construct public URL: `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/prompt-images/${path}`. (9) Return 201 with `{ url }`. (10) On upload error: return 500 with `{ error: "Upload failed" }`.
- [x] T016 [P] [US3] Create client-side upload helper with progress tracking in `src/lib/upload-image.ts` — (1) Export `uploadImage(file: File, onProgress: (percent: number) => void): Promise<string>`. (2) Use `XMLHttpRequest` with `upload.onprogress` event per contract in `specs/013-sell-form-enhancement/contracts/upload-image.md`. (3) Post FormData to `/api/upload/image`. (4) Resolve with the returned `url` on 201. (5) Reject with parsed error message on non-201 or network error. (6) Client-side pre-validation: check file size (10 MB) and MIME type before sending — reject immediately with localized error if invalid (avoids unnecessary network request).
- [x] T017 [US3] Replace blob URL image handling with Supabase upload in `src/components/sell/PromptFileStep.tsx` — (1) Import `uploadImage` from `src/lib/upload-image.ts`. (2) Replace `handleExampleImage` callback: instead of `URL.createObjectURL(file)`, call `uploadImage(file, onProgress)`. (3) Add per-slot upload state: `uploadProgress: Record<number, number>` (maps example index to 0-100 percent) and `uploadError: Record<number, string | null>`. (4) While uploading: show a shadcn `Progress` bar (or percentage text) in the image slot. (5) On success: call `form.setValue(\`examplePrompts.${index}.image\`, url)` with the permanent URL. (6) On failure: show localized error message (from i18n) with a "Retry" button. Do NOT set a broken URL in form state. (7) On image removal: clear the form field (do not delete from Storage — out of scope). (8) File input `accept` attribute: `image/jpeg,image/png,image/gif,image/webp`. (9) Ensure uploaded image URLs survive draft persistence (they are regular strings, not blob URLs).
- [x] T018 [US3] Run `npm run lint && npm run build` and fix all errors introduced in T015–T017 before proceeding.

**Checkpoint**: Images upload to Supabase Storage with progress indicator. URLs persist in localStorage draft. Uploaded images survive page refresh.

---

## Phase 6: User Story 4 — Payment Verification on Step 3 (Priority: P2)

**Goal**: Display a payment activation badge with checkmark on Step 3, re-verifying payment status on step load.

**Independent Test**: View Step 3 as an activated seller — verify green badge with checkmark is visible.

### Implementation for User Story 4

- [x] T019 [P] [US4] Create PaymentBadge component in `src/components/sell/PaymentBadge.tsx` — (1) "use client" component. (2) Accept props: `isActivated: boolean`, `isLoading: boolean`. (3) When `isLoading`: show a subtle skeleton/spinner. (4) When `isActivated`: show a green Badge (shadcn) with CheckCircle icon (Lucide) and "Payment Activated" text (i18n key). (5) When NOT activated: show a yellow/amber Badge with AlertTriangle icon and "Payment Not Activated" warning text, plus a link/button to return to Step 1. (6) Compact design — fits inline at the top of Step 3 content.
- [x] T020 [US4] Integrate PaymentBadge into Step 3 and re-verify payment status in `src/app/[locale]/sell/page.tsx` and `src/components/sell/PromptFileStep.tsx` — (1) In page.tsx: when `currentStep` transitions to 3, re-fetch `/api/connect/status` and update `paymentActivated` state. Add `paymentLoading` boolean state during fetch. (2) Pass `paymentActivated` and `paymentLoading` props to PromptFileStep. (3) In PromptFileStep.tsx: render `<PaymentBadge isActivated={paymentActivated} isLoading={paymentLoading} />` at the top of the step content (above the template editor). (4) If re-verification shows payment deactivated: disable the submit button and show the warning badge. (5) For free prompts: do not render PaymentBadge (not applicable).
- [x] T021 [US4] Run `npm run lint && npm run build` and fix all errors introduced in T019–T020 before proceeding.

**Checkpoint**: Payment badge visible on Step 3. Status re-verified on step load. Warning shown if deactivated.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, remove deprecated code, final verification

- [x] T022 Remove `src/components/sell/ConfirmationStep.tsx` and all imports/references to it — replaced by InlineSuccess. Remove the file and clean up any dead imports in page.tsx.
- [x] T023 Verify free prompt flow still works end-to-end — free prompts should skip Step 1, show 2-step indicator (Details, Content), persist draft correctly, and submit without payment badge. Run through the full free flow manually.
- [x] T024 Run full `npm run lint && npm run build` — fix any remaining errors across all modified files.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T001 (npm install) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on Phase 3 (US1) — needs the new step order established first
- **US3 (Phase 5)**: Depends on Phase 2 (foundational) + T003/T004 (storage client, schema) — can start in parallel with US1 if needed, but the PromptFileStep integration (T017) depends on US1's step reorder being done
- **US4 (Phase 6)**: Depends on US1 (Phase 3) — needs `paymentActivated` state in the form
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundation only — no dependencies on other stories. MVP target.
- **US2 (P1)**: Depends on US1 — persistence wraps the refactored step flow from US1.
- **US3 (P2)**: Setup (storage bucket/client) + Foundation. API route (T015) and upload helper (T016) can be built in parallel with US1. Step integration (T017) depends on US1's step reorder.
- **US4 (P2)**: Depends on US1 — needs `paymentActivated` prop flowing through the form.

### Within Each User Story

- Core logic before UI integration
- Parent component (page.tsx) before child components
- Lint/build verification after each story

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T003 (supabase client) ∥ T004 (upload schema)  — different files
```

**Phase 2 (Foundational)**:
```
T005 (ar translations) ∥ T006 (en translations)  — different files
```

**Phase 5 (US3)**:
```
T015 (API route) ∥ T016 (upload helper)  — different files
```

**Phase 6 (US4)**:
```
T019 (PaymentBadge component) can start while US2/US3 are in progress — independent file
```

**Cross-story parallelism** (if team capacity allows):
```
US3 T015+T016 (API route + helper) ∥ US1 (step reorder)  — different files
US4 T019 (PaymentBadge component) ∥ US2 or US3  — independent file
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T006)
3. Complete Phase 3: US1 — Payment-First Step Flow (T007–T010)
4. **STOP and VALIDATE**: Sellers see correct starting step based on payment status
5. This is a functional MVP — the core UX improvement is delivered

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 (step reorder) → Core flow change delivered (MVP)
3. US2 (persistence + inline success) → Draft safety + polished submission UX
4. US3 (image upload) → Persistent images via Supabase Storage
5. US4 (payment badge) → Trust confirmation on Step 3
6. Polish → Cleanup + final verification
7. Each story adds value without breaking previous stories

---

## Notes

- Total tasks: **24**
- US1: 4 tasks (T007–T010) | US2: 4 tasks (T011–T014) | US3: 4 tasks (T015–T018) | US4: 3 tasks (T019–T021)
- Setup: 4 tasks | Foundational: 2 tasks | Polish: 3 tasks
- The existing `ConfirmationStep.tsx` is not removed until Polish phase to avoid breaking the build during US1
- Each lint/build task (T010, T014, T018, T021, T024) is a verification gate — do not proceed past a gate with errors
- `SUPABASE_SERVICE_ROLE_KEY` must be added to `.env.local` manually (not committed) before T015 can work
