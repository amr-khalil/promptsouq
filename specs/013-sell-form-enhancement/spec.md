# Feature Specification: Sell Form Enhancement

**Feature Branch**: `013-sell-form-enhancement`
**Created**: 2026-02-18
**Status**: Draft
**Input**: User description: "Persist the sell prompt form if the user clicked on next the user should not lose the steps, upload the example images directly to Supabase Storage max file is 10 megabytes, make payment as first step if user not activated it, if activated start with second step, and the third step must be payment activated with check."

## Clarifications

### Session 2026-02-18

- Q: Should the form draft persist only within the current tab session, or survive tab closes and browser restarts? → A: Draft persists across tab closes and browser restarts (available until submitted or manually cleared).
- Q: Should uploaded example images be publicly accessible or require authentication? → A: Public URLs — anyone with the link can view the image (standard for marketplace listings).
- Q: What should happen after successful prompt submission? → A: Inline success state replaces the Step 3 form content (with "View Prompt" and "Sell Another" action buttons).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Conditional Payment-First Step Flow (Priority: P1)

A seller who has not activated their payment account visits the sell prompt page. They see a three-step flow where **Step 1 is Payment Setup**. They must complete payment activation before proceeding to prompt details. A seller who has already activated payment sees the same three steps but **starts directly on Step 2** (Step 1 is shown as completed with a checkmark).

**Why this priority**: Without payment activation, sellers cannot receive earnings. Making it the first mandatory step prevents sellers from filling out an entire form only to discover they cannot sell. This is the core flow change that affects every seller's experience.

**Independent Test**: Can be verified by toggling a user's Stripe Connect status and confirming the correct starting step is displayed.

**Acceptance Scenarios**:

1. **Given** a seller without an activated payment account, **When** they open the sell prompt page, **Then** they see Step 1 (Payment Setup) as the active step and cannot skip to Step 2.
2. **Given** a seller with a fully activated payment account, **When** they open the sell prompt page, **Then** they see Step 1 marked as completed with a checkmark and land directly on Step 2 (Prompt Details).
3. **Given** a seller on Step 1 who completes Stripe Connect onboarding and returns to the form, **When** the page loads, **Then** Step 1 shows as completed with a checkmark and the seller is moved to Step 2.
4. **Given** a seller with an activated payment account, **When** they view the step indicator, **Then** Step 1 displays a green checkmark icon and the label "Payment Activated" (or its Arabic equivalent).

---

### User Story 2 - Form Data Persistence Across Steps (Priority: P1)

A seller filling out the sell prompt form navigates between steps using the Next and Back buttons. All data they entered in previous steps is preserved. If the seller leaves the page and returns (e.g., after Stripe onboarding redirect), their draft is restored.

**Why this priority**: Losing form data is one of the most frustrating user experiences. This directly impacts form completion rates and seller satisfaction. Tied with P1 because it enables the payment-first flow to work seamlessly.

**Independent Test**: Can be verified by filling in data on Step 2, navigating to Step 3 and back, and confirming all Step 2 fields retain their values.

**Acceptance Scenarios**:

1. **Given** a seller who filled out all fields on Step 2 (Prompt Details), **When** they click Next to go to Step 3 and then click Back, **Then** all fields on Step 2 retain their previously entered values.
2. **Given** a seller who has entered data across multiple steps, **When** they refresh the page or return from an external redirect, **Then** their form data is restored and they resume at the step they left from.
3. **Given** a seller who successfully submits a prompt, **When** submission completes, **Then** the Step 3 form is replaced with an inline success state showing "View Prompt" and "Sell Another" buttons, and the saved draft is cleared.
4. **Given** a seller on the success state, **When** they click "Sell Another," **Then** the form resets to the appropriate starting step with all fields empty.
5. **Given** a seller on Step 1 who redirects to Stripe onboarding, **When** they return to the sell page, **Then** their form data from Step 2 (if any was entered previously) is preserved.

---

### User Story 3 - Direct Image Upload to Cloud Storage (Priority: P2)

A seller adding example images to their prompt uploads files directly to cloud storage. Each file has a maximum size of 10 megabytes. After uploading, a persistent URL replaces the temporary local preview so images survive page refreshes and are ready for prompt submission.

**Why this priority**: Currently images are stored as temporary browser-only URLs that break on refresh. Direct upload ensures images persist reliably and removes the need to re-upload after any page navigation.

**Independent Test**: Can be verified by uploading an image, refreshing the page, and confirming the image is still visible and the URL points to cloud storage.

**Acceptance Scenarios**:

1. **Given** a seller on Step 3, **When** they select an image file under 10 MB, **Then** the file uploads to cloud storage, a progress indicator is shown, and the uploaded image URL is stored in the form.
2. **Given** a seller who selects a file larger than 10 MB, **When** they attempt to upload, **Then** they see an error message in Arabic (or the current locale) stating the file exceeds the 10 MB limit, and the file is rejected.
3. **Given** a seller who has uploaded an example image and navigates away from Step 3 and returns, **When** the step renders, **Then** the uploaded image is still displayed using its permanent cloud URL.
4. **Given** a seller who uploads an image, **When** the upload fails due to a network error, **Then** they see an error message and the option to retry, and the form does not save a broken URL.
5. **Given** a seller who has uploaded multiple example images, **When** they remove one, **Then** the image is removed from the form and the remaining images are unaffected.

---

### User Story 4 - Payment Verification on Step 3 (Priority: P2)

On Step 3 (Prompt Content & Submit), the system displays a visible payment activation status with a checkmark confirming that the seller's payment account is active. This provides reassurance before final submission.

**Why this priority**: Showing a payment verification check on the final content step closes the trust loop. The seller knows their submission will be payable before they invest time in the detailed content.

**Independent Test**: Can be verified by viewing Step 3 as a payment-activated seller and confirming the payment check badge is visible.

**Acceptance Scenarios**:

1. **Given** a payment-activated seller on Step 3, **When** the step loads, **Then** a payment status badge with a green checkmark and "Payment Activated" text is displayed.
2. **Given** a seller who somehow reaches Step 3 without payment activation (edge case), **When** the step loads, **Then** the payment badge shows a warning state and the seller is prompted to complete payment setup before submitting.

---

### Edge Cases

- What happens when a seller's payment account is deactivated between Step 1 and Step 3? The system re-checks payment status on Step 3 and shows a warning if no longer active.
- What happens when the seller's browser storage is cleared while filling the form? The form starts fresh with empty fields; no error is shown.
- What happens when a seller uploads an image to an example prompt slot and then removes that example prompt entry? The uploaded image is orphaned in storage; the system does not delete it (cleanup is a future concern).
- What happens when the seller's session expires mid-form? Upon re-authentication, the saved draft (from browser storage) is still available since it is tied to the device, not the session.
- What happens when the seller has a partially completed Stripe account (details submitted but charges not yet enabled)? Step 1 shows as incomplete; the seller must complete onboarding before proceeding.
- What happens when the upload quota or storage limit is reached? The system shows a user-friendly error message and prevents the upload.
- What happens if the user uploads a non-image file (e.g., a PDF renamed to .jpg)? The system validates MIME type and rejects non-image files with an appropriate error message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST reorder the sell prompt form steps as: Step 1 (Payment Setup), Step 2 (Prompt Details), Step 3 (Prompt Content & Submit).
- **FR-002**: System MUST check the seller's payment activation status when the sell page loads and determine the correct starting step.
- **FR-003**: If the seller's payment account is fully activated, the system MUST skip Step 1 and place the seller on Step 2, showing Step 1 as completed with a checkmark.
- **FR-004**: If the seller's payment account is not activated, the system MUST start the seller on Step 1 and block navigation to Step 2 until payment is activated.
- **FR-005**: System MUST persist all form field values to browser storage whenever the seller navigates between steps (clicking Next or Back).
- **FR-006**: System MUST restore form field values from browser storage when the sell page loads, including after page refreshes and external redirects.
- **FR-007**: System MUST clear persisted form data after successful prompt submission.
- **FR-008**: System MUST upload example images directly to cloud storage when the seller selects a file.
- **FR-009**: System MUST enforce a maximum file size of 10 megabytes per image upload and reject files exceeding this limit with a localized error message.
- **FR-010**: System MUST validate that uploaded files are images (acceptable MIME types: image/jpeg, image/png, image/gif, image/webp) and reject non-image files.
- **FR-011**: System MUST display an upload progress indicator during image uploads.
- **FR-012**: System MUST replace temporary local image references with permanent cloud storage URLs in the form state after successful upload.
- **FR-013**: System MUST display a payment activation badge with a checkmark on Step 3, confirming the seller's payment account is active.
- **FR-014**: System MUST re-verify payment status when Step 3 loads and show a warning if the account is no longer active.
- **FR-015**: System MUST persist the current step number alongside form data so the seller returns to the correct step after a page refresh.
- **FR-016**: System MUST show a localized error message when an image upload fails and allow the seller to retry.
- **FR-017**: After successful submission, the system MUST replace the Step 3 form content with an inline success state displaying "View Prompt" and "Sell Another" action buttons.
- **FR-018**: When the seller clicks "Sell Another," the system MUST clear the saved draft and reset the form to the appropriate starting step (Step 1 or Step 2 based on payment status).

### Key Entities

- **Sell Form Draft**: A temporary representation of the seller's in-progress prompt submission, including all field values, current step number, and uploaded image URLs. Stored in persistent browser storage per device; survives tab closes and browser restarts. Cleared only upon successful submission.
- **Example Image**: An image file associated with an example prompt, uploaded to cloud storage with a publicly accessible URL. Has a maximum size of 10 MB. Supported formats: JPEG, PNG, GIF, WebP.
- **Payment Activation Status**: A boolean state indicating whether the seller's payment account is fully set up (both charges and payouts enabled). Determines step flow and badge display.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of sellers with activated payment accounts land directly on Step 2 without seeing the payment setup screen.
- **SC-002**: 0% of form data is lost when sellers navigate between steps using Next and Back buttons.
- **SC-003**: Form data survives page refreshes and external redirects (Stripe onboarding) with 100% field restoration accuracy.
- **SC-004**: All image uploads complete within 5 seconds for files under 5 MB on a standard broadband connection.
- **SC-005**: 100% of files exceeding 10 MB are rejected before upload with a clear error message displayed within 1 second.
- **SC-006**: Sellers see a visible payment activation checkmark on Step 3 within 2 seconds of the step loading.
- **SC-007**: Form completion rate (from first step to submission) improves by at least 20% compared to the current flow (measured over 30 days post-launch).

## Assumptions

- The existing three-step structure (Payment, Details, Content) will replace the current four-step flow (Details, File, Payout, Confirmation). After successful submission, an inline success state replaces the Step 3 form content, displaying "View Prompt" and "Sell Another" action buttons. No separate confirmation page or redirect.
- Persistent browser storage is used so drafts survive tab closes and browser restarts. If storage is unavailable, the form functions without persistence (graceful degradation).
- Cloud storage accepts uploads from authenticated users only. Sellers must be logged in to upload images.
- The 10 MB file size limit is validated on the client side before upload and enforced on the server side as well.
- Image uploads require seller authentication but the resulting URLs are publicly accessible (suitable for marketplace listing display). Images are stored in a seller-specific path in cloud storage.
- Accepted image formats are JPEG, PNG, GIF, and WebP based on standard web image formats.
- The payment activation check on Step 3 is a read-only status display, not a payment action. It serves as visual confirmation only.
- Free prompts follow a simpler flow (no Step 1 payment, no payment check on Step 3) and are not affected by the payment-first reordering.

## Scope Boundaries

### In Scope

- Reordering steps to payment-first for paid prompts
- Conditional step skipping based on payment activation status
- Form data persistence across step navigation and page refreshes
- Direct image upload to cloud storage with 10 MB limit
- Payment activation badge on Step 3
- Localized error messages (Arabic and English)

### Out of Scope

- Cleaning up orphaned images from cloud storage (future optimization)
- Changing the free prompt flow (remains as-is)
- Auto-save on a timer (persistence triggers only on step navigation)
- Image editing, cropping, or resizing before upload
- Bulk image upload (images are uploaded one at a time per example slot)
- Changes to the Stripe Connect onboarding flow itself
