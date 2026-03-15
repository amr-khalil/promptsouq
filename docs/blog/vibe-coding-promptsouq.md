# How I Built a Multivendor AI-Prompts Marketplace with Claude Code in One Day

What if you could build a full-stack marketplace — from database schema to Stripe payments — by having a conversation with an AI?

That is exactly what I did. Over the course of 16 feature branches, I built **PromptSouq**, a multivendor marketplace for AI prompts with Arabic RTL support, using Claude Code as my primary development partner. The process felt less like traditional programming and more like directing an incredibly competent collaborator who happened to know every API, every edge case, and every TypeScript quirk I would encounter along the way.

This approach has a name now: **vibe coding**. You describe what you want in natural language, the AI writes the code, and you iterate through conversation. You stay in the flow of _what_ you are building rather than getting bogged down in _how_ to build it. The AI handles the syntax, the boilerplate, the configuration files — while you focus on product decisions and architecture.

The result is a production-grade Next.js application with authentication, payments, subscriptions, seller storefronts, multilingual support, and a community gallery. Let me walk you through how it came together.

![PromptSouq Homepage](../screenshots/homepage.png)

## What is PromptSouq?

PromptSouq is a marketplace where users can browse, buy, and sell AI prompts — the kind you would use with ChatGPT, Midjourney, Stable Diffusion, DALL-E, and other generative AI tools. Think of it as an app store, but for carefully crafted prompts that produce reliable, high-quality AI outputs.

The "Souq" in the name is the Arabic word for marketplace, and that is intentional. PromptSouq is **Arabic-first**. The entire UI defaults to right-to-left layout, Arabic typography, and culturally relevant categorization. The Arabic-speaking world is a massively underserved market in the AI tooling space, and I wanted to build something that felt native rather than translated.

This meant tackling RTL layout from day one — not as an afterthought, but as the default. Every component, every spacing decision, every icon placement starts with Arabic and adapts to English, not the other way around.

Key features include prompt browsing with category filtering, full-text search, a shopping cart with Stripe checkout, seller storefronts with earnings dashboards, a subscription and credit system, and a community gallery where users share their AI-generated creations.

![PromptSouq Marketplace](../screenshots/marketplace.png)

## The Tech Stack

Choosing the right stack was critical. I needed something modern, type-safe, and capable of handling the complexity of a two-sided marketplace with payments.

**Next.js 16 with App Router** serves as the foundation. Server Components are the default — I use them for all data fetching — and I made a deliberate decision to avoid server actions entirely. All mutations go through API Route Handlers, which gives me explicit control over validation, error handling, and response shapes.

**Supabase** handles both authentication and the Postgres database. Auth supports email/password, Google OAuth, and Facebook OAuth via PKCE flow. Row Level Security policies protect every user-facing table. The combination of Supabase Auth and Postgres in a single platform eliminated an entire category of integration headaches.

**Drizzle ORM** provides type-safe database access with auto-generated migrations. The schema-first approach means I define tables in TypeScript and Drizzle generates the SQL — no hand-written migrations, ever.

**Stripe** powers payments: hosted Checkout for purchases, Subscriptions for recurring plans, and Connect for seller payouts. The Stripe SDK runs server-side only, with webhook signature verification for all events.

**Tailwind CSS 4** and **shadcn/ui** handle the UI layer. Theme-aware CSS variables drive the dark and light modes, and the component library gives me consistent, accessible building blocks. **i18next** handles Arabic/English localization with JSON translation files.

This stack is opinionated, and that is the point. Every technology choice constrains the solution space, which makes AI-assisted development dramatically more effective.

## The Vibe Coding Workflow

Here is where things get interesting. I did not just open Claude Code and start asking for random features. I used a structured workflow called **speckit** that turns natural language intent into executable, traceable development tasks.

The workflow has five phases:

**Specify.** I describe what I want in plain language. "I need a subscription system with monthly and yearly billing, credit top-ups, and a customer portal." Claude Code takes this and produces a formal specification — data models, API contracts, UI requirements, edge cases.

**Clarify.** The AI asks targeted questions to resolve ambiguities. "Should credits expire? Can users downgrade mid-cycle? What happens to unused credits on plan change?" This phase catches design gaps that would otherwise surface as bugs weeks later.

**Plan.** With the spec locked down, Claude Code generates an implementation plan. This includes research notes, database schema changes, API endpoint definitions, component hierarchies, and migration strategies. The plan is concrete enough to estimate effort and identify dependencies.

**Tasks.** The plan breaks down into ordered, dependency-aware tasks. Each task is atomic — it can be implemented, linted, and built independently. Task 1 might be "add subscription tables to Drizzle schema," Task 2 "create Stripe webhook handler for subscription events," and so on.

**Implement.** Claude Code executes each task, writing the code, running `npm run lint && npm run build` after every change, and fixing any errors before moving to the next task. If the build breaks, it diagnoses and fixes the issue in the same conversation turn.

Each feature gets its own Git branch — from `001-api-mock-data` through `016-supabase-auth-migration`. This means every feature has a clean PR, a traceable history, and an easy rollback path.

The key insight is that the AI is not just writing code. It is designing architecture, catching edge cases, enforcing the project's constitution (a living document of non-negotiable principles), and maintaining consistency across 16 features. The speckit workflow gives it structure; the constitution gives it constraints.

## Feature Walkthrough: 16 Branches to a Marketplace

The build progressed chronologically, each branch adding a layer of functionality.

**Branches 001-002: Foundation.** I started with mock data — hardcoded TypeScript arrays — to get the UI working fast. Branch 002 migrated everything to Supabase Postgres via Drizzle ORM. This is where the schema took shape: categories with slugs, prompts with UUID primary keys, seller data as flat columns reconstructed into nested objects at the API layer.

**Branches 003-004: Commerce.** Stripe Checkout integration turned PromptSouq from a gallery into a real store. The cart uses Zustand with persist middleware and localStorage, with a `useSyncExternalStore` pattern to handle React 19 hydration safely. The user dashboard shows purchase history, downloaded prompts, and account settings.

**Branches 006-008: Seller Experience.** Stripe Connect enables seller payouts. Each seller gets a public storefront page with their prompts, ratings, and bio. A leaderboard ranks sellers by sales and ratings — gamification that encourages quality.

![Prompt Detail Page](../screenshots/prompt-detail.png)

**Branches 009-010: Growth Mechanics.** Free prompts serve as lead magnets — users can browse and download select prompts without paying. The subscription system adds monthly and yearly plans with credit allocations, top-up purchases, and a Stripe Customer Portal for self-service billing.

![Subscription Plans](../screenshots/subscription.png)

**Branches 011-012: Localization and Search.** i18next handles Arabic and English with JSON translation files. The smart search bar features trending terms, recent search history, and real-time suggestions — all built with Zustand stores and Supabase queries.

**Branches 013-015: Polish.** Image uploads to Supabase Storage, admin dashboards with moderation tools, and a community gallery where users share AI-generated art. These features turned PromptSouq from a functional MVP into something that feels complete.

**Branch 016: The Big Migration.** Moving from Clerk to Supabase Auth was the most significant refactor of the project. Custom sign-in and sign-up pages, OAuth callback handling, email verification flows, password reset, admin role management via `app_metadata`, and a complete middleware rewrite for session management. This single branch touched nearly every authenticated component in the app.

## Challenges and Lessons Learned

Building PromptSouq was not frictionless. Even with AI assistance, certain problems required careful thinking.

**RTL layout** is harder than it looks. Logical CSS properties (`margin-inline-start` instead of `margin-left`) are essential. Tailwind's RTL utilities help, but you still need to audit every component for visual correctness in both directions. Icons that imply direction — arrows, chevrons, progress indicators — all need to flip.

**React 19 introduced subtle breaking changes.** Calling `setState` inside `useEffect` triggers lint errors that did not exist in React 18. The Zustand hydration pattern required `useSyncExternalStore` with a server snapshot of zero to avoid hydration mismatches.

**Drizzle ORM has type inference quirks.** If you assign a query to a variable and then conditionally chain `.limit()`, TypeScript infers different types for each branch. The fix is to always include `.limit()` with a fallback value rather than conditionally applying it.

**Build-time environment variables** caused headaches. The Stripe SDK constructor throws if the API key is undefined, which happens during `next build` when server-only env vars are not available. The solution is a lazy Proxy that defers initialization until first access.

**The auth migration** from Clerk to Supabase Auth was the biggest lesson. It touched authentication, middleware, session management, profile creation, admin checks, and every protected route. Having a clear spec and task breakdown made it manageable, but it was still a multi-day effort.

The overarching lesson: **AI-assisted development works best with clear constraints.** The project constitution, the speckit workflow, the lint-and-build check after every task — these guardrails let the AI move fast without breaking things. Without them, you get code that works in isolation but falls apart at integration.

## What is Next

PromptSouq is far from finished. The most exciting upcoming feature is **Flux API integration** via bfl.ai.

This will add image and video generation capabilities directly into the marketplace. Users will be able to test prompts with live previews — select a Midjourney prompt, see what it generates, then buy with confidence. Prompt sellers can showcase their work with real outputs rather than static screenshots.

The vision is for PromptSouq to evolve from a text-prompt marketplace into a full creative AI platform where buying a prompt is just the beginning of the creative workflow.

Beyond that, the roadmap includes a mobile app, advanced analytics for sellers, and AI-powered prompt recommendations based on user preferences and purchase history.

## Closing Thoughts

Sixteen branches. One AI coding partner. A production-grade multivendor marketplace with Arabic RTL support, authentication, payments, subscriptions, seller tools, localization, and a community gallery.

Vibe coding is not about replacing developers. It is about changing what you spend your time on. Instead of wrestling with Stripe webhook signatures or Drizzle migration syntax, I spent my time on product decisions — what features matter, how the user experience should flow, what the architecture should look like. The AI handled the implementation details with remarkable consistency.

If you are curious, the full source code is on GitHub: [github.com/amr-khalil/promptsouq](https://github.com/amr-khalil/promptsouq). Star it, clone it, break it apart. If you are building something similar — especially for an underserved language market — I hope this gives you a useful blueprint.

PromptSouq was built with [Claude Code](https://claude.ai/code) by Anthropic. If you have not tried vibe coding yet, I genuinely think you should. The barrier to building ambitious projects has never been lower.
