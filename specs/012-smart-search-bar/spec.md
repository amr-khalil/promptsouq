# Feature Specification: Smart Search Bar

**Feature Branch**: `012-smart-search-bar`
**Created**: 2026-02-17
**Status**: Draft
**Input**: User description: "Optimize the search bar — add the most recent searches of the user and the trending searches when the user is in the input field"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recent Searches (Priority: P1)

A returning user focuses on the search bar and immediately sees their most recent search terms displayed in a dropdown panel. This lets them quickly repeat a previous search without retyping. Each recent search item is clickable to instantly execute that search. Users can also remove individual recent searches or clear all history at once.

**Why this priority**: Recent searches provide the highest personal value — users frequently search for the same or similar terms. This directly reduces friction and speeds up navigation for returning visitors.

**Independent Test**: Can be fully tested by performing 3-4 searches, then re-focusing the search bar to verify all previous terms appear and are clickable.

**Acceptance Scenarios**:

1. **Given** a user who has searched for "ChatGPT" and "Midjourney" previously, **When** the user focuses the search bar (empty input), **Then** a dropdown panel appears showing "ChatGPT" and "Midjourney" as recent search items, ordered most-recent first.
2. **Given** a user viewing recent searches in the dropdown, **When** the user clicks on "ChatGPT", **Then** the search is executed with "ChatGPT" as the query and results are displayed.
3. **Given** a user viewing recent searches, **When** the user clicks the remove icon on a single recent search, **Then** that item is removed from the list without affecting others.
4. **Given** a user viewing recent searches, **When** the user clicks "Clear all", **Then** all recent search history is removed and the section disappears.
5. **Given** a user who has never searched before, **When** the user focuses the search bar, **Then** the "Recent Searches" section is not displayed.

---

### User Story 2 - Trending Searches (Priority: P2)

When a user focuses the search bar, they see a "Trending Searches" section showing popular search terms or popular prompts on the platform. This helps users discover what's popular, especially new users who don't know what to search for.

**Why this priority**: Trending searches guide new and returning users toward popular content, increasing engagement and discoverability. It requires a data source for trends but adds significant value for exploration.

**Independent Test**: Can be fully tested by focusing the search bar and verifying trending items appear. Clicking a trending item should execute the search.

**Acceptance Scenarios**:

1. **Given** any user focuses the search bar (empty input), **When** the dropdown opens, **Then** a "Trending Searches" section displays up to 5 trending items.
2. **Given** a user sees trending searches, **When** the user clicks on a trending item, **Then** the search is executed with that term as the query.
3. **Given** both recent searches and trending searches exist, **When** the user focuses the empty search bar, **Then** recent searches appear above trending searches, with clear section labels.
4. **Given** the user starts typing in the search bar, **When** the input has 2+ characters, **Then** the recent/trending panel is replaced by the existing live suggestions (current behavior preserved).

---

### User Story 3 - Combined Search Experience (Priority: P3)

The search bar intelligently switches between three states: (1) empty input shows recent + trending, (2) typing shows live suggestions from the API, and (3) submitting navigates to results. The transitions between states are smooth and the user always has clear context about what they're seeing.

**Why this priority**: This story ties together the full experience and ensures no regressions in the existing suggestion flow. It builds on P1 and P2 to deliver a polished end-to-end interaction.

**Independent Test**: Can be tested by focusing the search bar (see recent/trending), typing a query (see suggestions), clearing the input (see recent/trending again), and submitting (navigate to results).

**Acceptance Scenarios**:

1. **Given** a user has recent searches and input is empty, **When** the user types a character then deletes it (back to empty), **Then** the dropdown switches back from suggestions to showing recent + trending.
2. **Given** a user is viewing the recent/trending panel, **When** the user presses Escape, **Then** the dropdown closes (existing behavior preserved).
3. **Given** a user clicks outside the search bar while the dropdown is open, **When** focus is lost, **Then** the dropdown closes (existing behavior preserved).

---

### Edge Cases

- What happens when the user has exactly the maximum number of recent searches stored (10) and performs a new search? The oldest entry is evicted.
- What happens if the trending data source is unavailable or returns empty? The "Trending Searches" section is hidden; only recent searches are shown (if any).
- What happens if the user clears browser storage? Recent searches are lost — this is expected and acceptable.
- What happens on a very narrow mobile screen? The dropdown panel adapts to full width and items remain tappable (minimum 44px tap targets).
- What happens when recent searches and trending searches contain the same term? The term appears only in recent searches (deduplicated from trending).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store up to 10 recent search terms per user on the client side, persisting across page navigations and browser sessions. A search term is saved only when the user explicitly submits the search form (Enter key or Search button click) — clicking a suggestion or a recent/trending item does not create a new recent search entry.
- **FR-002**: System MUST display recent searches in reverse chronological order (most recent first) when the search input is focused and empty.
- **FR-003**: System MUST allow users to remove individual recent search entries via a dismiss/remove control on each item.
- **FR-004**: System MUST allow users to clear all recent search history at once via a "Clear all" action.
- **FR-005**: System MUST not store duplicate search terms — if a user searches for a term that already exists in their history, it moves to the top instead of creating a duplicate.
- **FR-006**: System MUST display up to 5 trending search items when the search input is focused and empty.
- **FR-007**: Trending searches MUST be sourced from the top-selling prompts on the platform, ranked by sales count (highest first). Each trending item displays the prompt title as the search term.
- **FR-008**: System MUST transition from the recent/trending dropdown to the existing live suggestions dropdown when the user types 2 or more characters.
- **FR-009**: System MUST transition back to the recent/trending dropdown when the user clears the input field.
- **FR-010**: Clicking a recent or trending search item MUST execute the search (same behavior as submitting the search form).
- **FR-011**: System MUST support both Arabic and English labels for the recent/trending sections (bilingual UI consistent with existing i18n).
- **FR-012**: System MUST deduplicate terms that appear in both recent searches and trending searches — such terms appear only in the "Recent Searches" section.
- **FR-013**: System MUST preserve all existing search bar behaviors (Escape to close, click-outside to close, clear button, keyboard navigation).

### Key Entities

- **Recent Search Entry**: A search term string stored locally, with an implicit timestamp for ordering. Maximum 10 entries per user.
- **Trending Search Item**: The title of a top-selling prompt on the platform, ranked by sales count. Refreshed periodically. Up to 5 items displayed.

## Clarifications

### Session 2026-02-17

- Q: What action triggers saving a term to recent search history? → A: Only explicit form submissions (Enter key or Search button click). Clicking suggestions, recent items, or trending items does not save a new entry.
- Q: How should "trending" be defined? → A: Top prompts by sales count (bestselling). Not by views, ratings, or recency.

## Assumptions

- Recent searches are stored on the client side (browser storage) rather than server-side, since user authentication is not required to use search and this approach avoids database changes for search history.
- "Trending" is defined as the top prompts ranked by sales count (bestselling), derived from existing platform data — not from aggregated search query logs (which would require new analytics infrastructure).
- The trending data can be fetched from an existing or lightweight API endpoint that returns popular prompt titles.
- The maximum of 10 recent searches and 5 trending items provides a good balance between usefulness and UI clutter.
- Mobile and desktop share the same dropdown behavior, with responsive layout adjustments.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access their 5 most recent searches within 1 click (focus + click) after returning to the search bar.
- **SC-002**: New users see trending content suggestions immediately upon focusing the search bar, reducing "blank search" abandonment.
- **SC-003**: The search dropdown appears within 300ms of focusing the input field (recent searches are instant from local storage; trending items load quickly).
- **SC-004**: 100% of existing search bar functionality (suggestions, keyboard shortcuts, navigation) continues to work without regression.
- **SC-005**: Search bar works correctly in both Arabic and English language modes with proper RTL/LTR text rendering.
