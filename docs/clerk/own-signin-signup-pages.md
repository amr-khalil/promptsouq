Build your own sign-in-or-up page for your Next.js app with Clerk
Build a sign-in-or-up page
Make the sign-in-or-up route public
Update your environment variables
Visit your new page
Next steps

Copy as markdown
Open in ChatGPT
Open in Claude
Open in Cursor
Open in DeepSeek
Open in Gemini
Open in Grok
Open in Perplexity
Open in T3 Chat
Available in other SDKs

This guide shows you how to use the 
<SignIn />
 component to build a custom page that allows users to sign in or sign up within a single flow.

To set up separate sign-in and sign-up pages, follow this guide, and then follow the 
custom sign-up page guide
.

Note

Just getting started with Clerk and Next.js? See the 
quickstart tutorial
!

Build a sign-in-or-up page
The following example demonstrates how to render the 
<SignIn />
 component on a dedicated page using the Next.js optional catch-all route.

app/sign-in/[[...sign-in]]/page.tsx

import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return <SignIn />
}
Make the sign-in-or-up route public
By default, clerkMiddleware() makes all routes public. This step is specifically for applications that have configured clerkMiddleware() to make 
all routes protected
. If you have not configured clerkMiddleware() to protect all routes, you can skip this step.

Important

If you're using Next.js ≤15, name your file middleware.ts instead of proxy.ts. The code itself remains the same; only the filename changes.

To make the sign-in route public:

Navigate to your proxy.ts file.
Create a new 
route matcher
 that matches the sign-in route, or you can add it to your existing route matcher that is making routes public.
Create a check to see if the user's current route is a public route. If it is not a public route, use 
auth.protect()
 to protect the route.
proxy.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
Update your environment variables
Set the CLERK_SIGN_IN_URL environment variable to tell Clerk where the <SignIn /> component is being hosted.
Set CLERK_SIGN_IN_FALLBACK_REDIRECT_URL as a fallback URL incase users visit the /sign-in route directly.
Set CLERK_SIGN_UP_FALLBACK_REDIRECT_URL as a fallback URL incase users select the 'Don't have an account? Sign up' link at the bottom of the component.
Learn more about these environment variables and how to customize Clerk's redirect behavior in the dedicated guide.

.env

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
Visit your new page
Run your project with the following command:

npm
pnpm
yarn
bun
terminal

npm run dev
Visit your new custom page locally at localhost:3000/sign-in.



--------------------------------


Build your own sign-up page for your Next.js app with Clerk
Build a sign-up page
Make the sign-up route public
Update your environment variables
Visit your new page
Next steps

Copy as markdown
Open in ChatGPT
Open in Claude
Open in Cursor
Open in DeepSeek
Open in Gemini
Open in Grok
Open in Perplexity
Open in T3 Chat
Available in other SDKs

By default, the 
<SignIn />
 component handles signing in and signing up, but if you'd like to have a dedicated sign-up page, this guide shows you how to use the 
<SignUp />
 component to build a custom sign-up page.

To set up a single sign-in-or-up page, follow the 
custom sign-in-or-up page guide
.

Note

Just getting started with Clerk and Next.js? See the 
quickstart tutorial
!

Build a sign-up page
The following example demonstrates how to render the 
<SignUp />
 component on a dedicated sign-up page using the Next.js optional catch-all route.

app/sign-up/[[...sign-up]]/page.tsx

import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return <SignUp />
}
Make the sign-up route public
By default, clerkMiddleware() makes all routes public. This step is specifically for applications that have configured clerkMiddleware() to make 
all routes protected
. If you have not configured clerkMiddleware() to protect all routes, you can skip this step.

Important

If you're using Next.js ≤15, name your file middleware.ts instead of proxy.ts. The code itself remains the same; only the filename changes.

To make the sign-up route public:

Navigate to your proxy.ts file.
Add the sign-up route to your existing route matcher that is making routes public.
proxy.ts

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
Update your environment variables
Set the CLERK_SIGN_UP_URL environment variable to tell Clerk where the <SignUp /> component is being hosted.
Set CLERK_SIGN_UP_FALLBACK_REDIRECT_URL as a fallback URL incase users visit the /sign-up route directly.
Set CLERK_SIGN_IN_FALLBACK_REDIRECT_URL as a fallback URL incase users select the 'Already have an account? Sign in' link at the bottom of the component.
Learn more about these environment variables and how to customize Clerk's redirect behavior in the dedicated guide.

.env

NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
Visit your new page
Run your project with the following command:

npm
pnpm
yarn
bun
terminal

npm run dev
Visit your new custom page locally at localhost:3000/sign-up.