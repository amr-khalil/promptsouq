---
title: Build your own UI (custom flows)
description: Learn the process behind building custom sign-up and sign-in flows with Clerk.
lastUpdated: 2026-02-06T22:48:01.000Z
sdkScoped: "false"
canonical: /docs/guides/development/custom-flows/overview
sourceFile: /docs/guides/development/custom-flows/overview.mdx
---

A **custom flow** refers to a user interface built entirely from scratch using the Clerk API.

Custom flows are considered **advanced** and are generally not recommended for most use cases. They require more development effort and are not as easy to maintain as the prebuilt components. However, if <SDKLink href="/docs/:sdk:/reference/components/overview" sdks={["react","nextjs","js-frontend","chrome-extension","expo","expressjs","fastify","react-router","remix","tanstack-react-start","go","astro","nuxt","vue","ruby","js-backend"]}>prebuilt components</SDKLink> don't meet your specific needs or if you require more control over the logic, you can rebuild the existing Clerk flows using the Clerk API.

**If you choose this approach, the Clerk support team will do their best to assist you, but they cannot guarantee a resolution due to the highly customized nature of custom flows.**

> \[!TIP]
> The information in this guide will help you get a general understanding of custom flow concepts. To skip to code examples, choose the guide that best fits your needs from the navigation on the left.

## How authentication flows work in Clerk

Before building custom authentication flows, read the following sections to get a general understanding of how authentication flows work in Clerk.

### Sign-up flow

The [`SignUp`](/docs/reference/javascript/sign-up) object is the pivotal concept in the sign-up process. It is used to gather the user's information, verify their email address or phone number, add OAuth accounts, and finally, convert them into a [`User`](/docs/reference/javascript/user).

Every `SignUp` must meet specific requirements before being converted into a `User`. These requirements are defined by the instance settings you selected in the [Clerk Dashboard](https://dashboard.clerk.com/). For example, on the [**User & authentication**](https://dashboard.clerk.com/~/user-authentication/user-and-authentication) page, you can [configure email and password, email links, or SMS codes as authentication strategies](/docs/guides/configure/auth-strategies/sign-up-sign-in-options).

Once all requirements are met, the `SignUp` will turn into a new `User`, and an active session for that `User` will be created on the current [`Client`](/docs/reference/javascript/client).

Don't worry about collecting all the required fields at once and passing them to a single request. The API is designed to accommodate progressive multi-step sign-up forms.

The following steps outline the sign-up process:

1. Initiate the sign-up process by collecting the user's authentication information and passing the appropriate parameters to the [`create()`](/docs/reference/javascript/sign-in#create) method.
2. Prepare the verification.
3. Attempt to complete the verification.
4. If the verification is successful, set the newly created session as the active session by passing the `SignIn.createdSessionId` to the [`setActive()`](/docs/reference/javascript/clerk#set-active) method on the `Clerk` object.
5. Use the `navigate` parameter in [`setActive()`](/docs/reference/javascript/types/set-active-params) to access [`Session.currentTask`](/docs/reference/javascript/types/session-task) and check for pending session tasks.

#### The state of a `SignUp`

The `SignUp` object will show **the state of the current sign-up** in the `status` property.

If you need further help on where things are and what you need to do next, you can also consult the `required_fields`, `optional_fields`, and `missingFields` properties.

<Properties>
  * `requiredFields`

  All fields that must be collected before the `SignUp` converts into a `User`.

  ***

  * `optionalFields`

  All fields that can be collected, but are not necessary to convert the `SignUp` into a `User`.

  ***

  * `missingFields`

  A subset of `requiredFields`. It contains all fields that still need to be collected before a `SignUp` can be converted into a `User`. Note that this property will be updated dynamically. As you add more fields to the `SignUp`, they will be removed. Once this property is empty, your `SignUp` will automatically convert into a `User`.
</Properties>

#### Verified fields

Some properties of the `SignUp`, such as `emailAddress` and `phoneNumber`, must be **verified** before they are **fully** added to the `SignUp` object.

The `SignUp` object will show **the state of verification** in the following properties:

<Properties>
  * `unverifiedFields`

  A list of all [`User`](/docs/reference/javascript/user) attributes that need to be verified and are pending verification. This is a list that gets updated dynamically. When verification for all required fields has been successfully completed, this value will become an empty array.

  ***

  * `verifications`

  An object that describes the current state of verification for the [`SignUp`](/docs/reference/javascript/sign-in). There are currently three different keys: `email_address`, `phone_number`, and `external_account`.
</Properties>

### Sign-in flow

The [`SignIn`](/docs/reference/javascript/sign-in) object is the pivotal concept in the sign-in process.

Sign-ins are initiated by creating a `SignIn` object on the current `Client`. If the sign-in is successfully authenticated, it will transform into an active session for that [`User`](/docs/reference/javascript/user) on the current `Client`.

The following steps outline the sign-in process:

1. Initiate the sign-in process by collecting the user's authentication information and passing the appropriate parameters to the [`create()`](/docs/reference/javascript/sign-in#create) method.
2. Prepare the <Tooltip><TooltipTrigger>first factor verification</TooltipTrigger><TooltipContent>**First factor** is the first factor of authentication that is required to complete the authentication process. For example, when a user signs in with email and password, the password is the first factor. **First factor verification** is the process of verifying a user's identity using a single factor. This can be compared to <Tooltip><TooltipTrigger>second factor verification</TooltipTrigger><TooltipContent>**Second factor verification**, also known as two-factor authentication (2FA) or [multi-factor authentication (MFA)](/docs/guides/configure/auth-strategies/sign-up-sign-in-options#multi-factor-authentication), is the process of verifying a user's identity using an additional factor. For example, if a user signs in with their email and password, and then, is asked to also provide an <Tooltip><TooltipTrigger>OTP</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip> sent to their phone number, the OTP is the <Tooltip><TooltipTrigger>second factor</TooltipTrigger><TooltipContent>A **second factor** is an additional factor of authentication that is required to complete the authentication process. For example, if a user signs in with their email and password, and then is asked to also provide an <Tooltip><TooltipTrigger>OTP</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip> sent to their email in order to verify their identity, the email OTP is the second factor.</TooltipContent></Tooltip>.</TooltipContent></Tooltip>, also known as two-factor authentication (2FA) or multi-factor authentication (MFA), where the user needs to provide an additional factor to verify their identity.</TooltipContent></Tooltip>. Users must complete a first factor verification to prove their identity. This can be something like providing a password, an email link, a <Tooltip><TooltipTrigger>one-time password (OTP)</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip>, a Web3 wallet address, or providing proof of their identity through an external social account (SSO/OAuth).
3. Attempt to complete the first factor verification.
4. Optionally, if you have enabled [multi-factor (MFA)](/docs/guides/configure/auth-strategies/sign-up-sign-in-options) for your application, you will need to prepare the <Tooltip><TooltipTrigger>second factor verification</TooltipTrigger><TooltipContent>**Second factor verification**, also known as two-factor authentication (2FA) or [multi-factor authentication (MFA)](/docs/guides/configure/auth-strategies/sign-up-sign-in-options#multi-factor-authentication), is the process of verifying a user's identity using an additional factor. For example, if a user signs in with their email and password, and then, is asked to also provide an <Tooltip><TooltipTrigger>OTP</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip> sent to their phone number, the OTP is the <Tooltip><TooltipTrigger>second factor</TooltipTrigger><TooltipContent>A **second factor** is an additional factor of authentication that is required to complete the authentication process. For example, if a user signs in with their email and password, and then is asked to also provide an <Tooltip><TooltipTrigger>OTP</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip> sent to their email in order to verify their identity, the email OTP is the second factor.</TooltipContent></Tooltip>.</TooltipContent></Tooltip> for users who have set up MFA for their account.
5. Attempt to complete the <Tooltip><TooltipTrigger>second factor verification</TooltipTrigger><TooltipContent>**Second factor verification**, also known as two-factor authentication (2FA) or [multi-factor authentication (MFA)](/docs/guides/configure/auth-strategies/sign-up-sign-in-options#multi-factor-authentication), is the process of verifying a user's identity using an additional factor. For example, if a user signs in with their email and password, and then, is asked to also provide an <Tooltip><TooltipTrigger>OTP</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip> sent to their phone number, the OTP is the <Tooltip><TooltipTrigger>second factor</TooltipTrigger><TooltipContent>A **second factor** is an additional factor of authentication that is required to complete the authentication process. For example, if a user signs in with their email and password, and then is asked to also provide an <Tooltip><TooltipTrigger>OTP</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip> sent to their email in order to verify their identity, the email OTP is the second factor.</TooltipContent></Tooltip>.</TooltipContent></Tooltip>.
6. If verification is successful, set the newly created session as the active session by passing the `SignIn.createdSessionId` to the [`setActive()`](/docs/reference/javascript/clerk#set-active) method on the `Clerk` object.
7. Use the `navigate` parameter in [`setActive()`](/docs/reference/javascript/types/set-active-params) to access [`Session.currentTask`](/docs/reference/javascript/types/session-task) and check for pending session tasks.

### Session tasks

Session tasks require users to complete specific actions after authentication, such as selecting an Organization. These tasks ensure that users meet all requirements before gaining full access to your application.

For detailed information about configuring and implementing session tasks, see the [dedicated guide](/docs/guides/configure/session-tasks).

## Next steps

Now that you have a general understanding of how authentication flows work in Clerk, you can start building your custom flows. To get started, choose the guide that best fits your needs from the list of guides in the navigation on the left.


--------------

---
title: Error handling
description: Provide your users with useful information about the errors being
  returned from sign-up and sign-in requests.
lastUpdated: 2026-02-06T22:48:01.000Z
sdkScoped: "false"
canonical: /docs/guides/development/custom-flows/error-handling
sourceFile: /docs/guides/development/custom-flows/error-handling.mdx
---

Clerk-related errors are returned as an array of [`ClerkAPIError`](/docs/reference/javascript/types/clerk-api-error) objects. These errors contain a `code`, `message`, `longMessage` and `meta` property. These properties can be used to provide your users with useful information about the errors being returned from sign-up and sign-in requests.

> \[!TIP]
> To see a list of all possible errors, refer to the [Errors](/docs/guides/development/errors/overview) documentation.

## Example

The following example uses the [email & password sign-in custom flow](/docs/guides/development/custom-flows/authentication/email-password) to demonstrate how to handle errors returned during the sign-in process.

<Tabs items={["Next.js", "JavaScript"]}>
  <Tab>
    This example is written for Next.js App Router but it can be adapted for any React-based framework.

    ```tsx {{ filename: 'app/sign-in/[[...sign-in]]/page.tsx', mark: [[6, 7], 13, [21, 22], [45, 48], [79, 85]] }}
    'use client'

    import * as React from 'react'
    import { useSignIn } from '@clerk/nextjs'
    import { useRouter } from 'next/navigation'
    import { ClerkAPIError } from '@clerk/types'
    import { isClerkAPIResponseError } from '@clerk/nextjs/errors'

    export default function SignInForm() {
      const { isLoaded, signIn, setActive } = useSignIn()
      const [email, setEmail] = React.useState('')
      const [password, setPassword] = React.useState('')
      const [errors, setErrors] = React.useState<ClerkAPIError[]>()

      const router = useRouter()

      // Handle the submission of the sign-in form
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Clear any errors that may have occurred during previous form submission
        setErrors(undefined)

        if (!isLoaded) {
          return
        }

        // Start the sign-in process using the email and password provided
        try {
          const signInAttempt = await signIn.create({
            identifier: email,
            password,
          })

          // If sign-in process is complete, set the created session as active
          // and redirect the user
          if (signInAttempt.status === 'complete') {
            await setActive({
              session: signInAttempt.createdSessionId,
              navigate: async ({ session }) => {
                if (session?.currentTask) {
                  // Check for tasks and navigate to custom UI to help users resolve them
                  // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                  console.log(session?.currentTask)
                  return
                }

                router.push('/')
              },
            })
          } else {
            // If the status is not complete, check why. User may need to
            // complete further steps.
            console.error(JSON.stringify(signInAttempt, null, 2))
          }
        } catch (err) {
          if (isClerkAPIResponseError(err)) setErrors(err.errors)
          console.error(JSON.stringify(err, null, 2))
        }
      }

      // Display a form to capture the user's email and password
      return (
        <>
          <h1>Sign in</h1>
          <form onSubmit={(e) => handleSubmit(e)}>
            <div>
              <label htmlFor="email">Enter email address</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                type="email"
                value={email}
              />
            </div>
            <div>
              <label htmlFor="password">Enter password</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                name="password"
                type="password"
                value={password}
              />
            </div>
            <button type="submit">Sign in</button>
          </form>

          {errors && (
            <ul>
              {errors.map((el, index) => (
                <li key={index}>{el.longMessage}</li>
              ))}
            </ul>
          )}
        </>
      )
    }
    ```
  </Tab>

  <Tab>
    <CodeBlockTabs options={["index.html", "main.js"]}>
      ```html {{ filename: 'index.html', mark: [22] }}
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Clerk + JavaScript App</title>
        </head>
        <body>
          <div id="signed-in"></div>

          <div id="sign-in">
            <h2>Sign in</h2>
            <form id="sign-in-form">
              <label for="email">Enter email address</label>
              <input name="email" id="sign-in-email" />
              <label for="password">Enter password</label>
              <input name="password" id="sign-in-password" />
              <button type="submit">Continue</button>
            </form>
          </div>

          <p id="error"></p>

          <script type="module" src="/src/main.js" async crossorigin="anonymous"></script>
        </body>
      </html>
      ```

      ```js {{ filename: 'main.js', mark: [[43, 49]] }}
      import { Clerk } from '@clerk/clerk-js'

      const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

      const clerk = new Clerk(pubKey)
      await clerk.load()

      if (clerk.isSignedIn) {
        // Mount user button component
        document.getElementById('signed-in').innerHTML = `
            <div id="user-button"></div>
          `

        const userbuttonDiv = document.getElementById('user-button')

        clerk.mountUserButton(userbuttonDiv)
      } else if (clerk.session?.currentTask) {
        // Check for pending tasks and display custom UI to help users resolve them
        // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
        switch (clerk.session.currentTask.key) {
          case 'choose-organization': {
            document.getElementById('app').innerHTML = `
                    <div id="task"></div>
                  `

            const taskDiv = document.getElementById('task')

            clerk.mountTaskChooseOrganization(taskDiv)
          }
        }
      } else {
        // Handle the sign-in form
        document.getElementById('sign-in-form').addEventListener('submit', async (e) => {
          e.preventDefault()

          const formData = new FormData(e.target)
          const emailAddress = formData.get('email')
          const password = formData.get('password')

          try {
            // Start the sign-in process
            const signInAttempt = await clerk.client.signIn.create({
              identifier: emailAddress,
              password,
            })

            // If the sign-in is complete, set the user as active
            if (signInAttempt.status === 'complete') {
              await clerk.setActive({ session: signInAttempt.createdSessionId })

              location.reload()
            } else {
              // If the status is not complete, check why. User may need to
              // complete further steps.
              console.error(JSON.stringify(signInAttempt, null, 2))
            }
          } catch (error) {
            if (isClerkAPIResponseError(err)) {
              const errors = err.errors
              document.getElementById('error').textContent = errors[0].longMessage
            }
            console.error(JSON.stringify(err, null, 2))
          }
        })
      }
      ```
    </CodeBlockTabs>
  </Tab>
</Tabs>

## Special error cases

### User locked

If you have [account lockout](/docs/guides/secure/user-lockout) enabled on your instance and the user reaches the maximum allowed attempts ([see list of relevant actions here](/docs/guides/secure/user-lockout)), you will receive an HTTP status of `403 (Forbidden)` and the following error payload:

```json
{
  "errors": [
    {
      "message": "Account locked",
      "long_message": "Your account is locked. You will be able to try again in 30 minutes. For more information, contact support.",
      "code": "user_locked",
      "meta": {
        "lockout_expires_in_seconds": 1800
      }
    }
  ]
}
```

`lockout_expires_in_seconds` represents the time remaining until the user is able to attempt authentication again.
In the above example, 1800 seconds (or 30 minutes) are left until they are able to retry, as of the current moment.

The admin might have [configured](/docs/guides/secure/user-lockout#customize-max-sign-in-attempts-and-lockout-duration) e.g. a 45-minute lockout duration.
Thus, 15 minutes after one has been locked, 30 minutes will still remain until the lockout lapses.

You can opt to render the error message returned as-is or format the supplied `lockout_expires_in_seconds` value as per your liking in your own custom error message.

For instance, if you wish to inform a user at which absolute time they will be able to try again, you could add the remaining seconds to the current time and format the resulting timestamp.

<Tabs items={["Next.js"]}>
  <Tab>
    ```js {{ filename: 'app/sign-in/[[...sign-in]]/page.tsx' }}
    if (errors[0].code === 'user_locked') {
      // Get the current date and time
      let currentDate = new Date()

      // Add the remaining seconds until lockout expires
      currentDate.setSeconds(currentDate.getSeconds() + errors[0].meta.lockout_expires_in_seconds)

      // Format the resulting date and time into a human-readable string
      const lockoutExpiresAt = currentDate.toLocaleString()

      // Do something with lockoutExpiresAt
      console.log('Your account is locked, you will be able to try again at ' + lockoutExpiresAt)
    }
    ```
  </Tab>
</Tabs>

### Password compromised

If you have marked a user's password as compromised and the user has another way to identify themselves, such as an email address (so they can use email <Tooltip><TooltipTrigger>OTP</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip> or email link), or a phone number (so they can use an SMS <Tooltip><TooltipTrigger>OTP</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip>), you will receive an HTTP status of `422 (Unprocessable Entity)` and the following error payload:

```json
{
  "errors": [
    {
      "long_message": "Your password may be compromised. To protect your account, please continue with an alternative sign-in method. You will be required to reset your password after signing in.",
      "code": "form_password_compromised",
      "meta": {
        "name": "param"
      }
    }
  ]
}
```

When a user password is marked as compromised, they will not be able to sign in with their compromised password, so you should prompt them to sign-in with another method. If they do not have any other identification methods to sign-in, e.g if they only have username and password, they will be signed in but they will be required to reset their password.

> \[!WARNING]
> If your instance is older than December 18, 2025, you will need to <Tooltip><TooltipTrigger>update your instance</TooltipTrigger><TooltipContent>See the [**Updates**](https://dashboard.clerk.com/~/updates) page in the Clerk Dashboard to see the available updates for your instance.</TooltipContent></Tooltip> to the **Reset password session task** update.

<Tabs items={["Next.js"]}>
  <Tab>
    This example is written for Next.js App Router but it can be adapted for any React-based framework.

    ```tsx {{ filename: 'app/sign-in/page.tsx' }}
    'use client'

    import * as React from 'react'
    import { useSignIn } from '@clerk/nextjs'
    import { useRouter } from 'next/navigation'
    import { ClerkAPIError, EmailCodeFactor, SignInFirstFactor } from '@clerk/types'
    import { isClerkAPIResponseError } from '@clerk/nextjs/errors'

    const SignInWithEmailCode = () => {
      const { isLoaded, signIn, setActive } = useSignIn()
      const [errors, setErrors] = React.useState<ClerkAPIError[]>()
      const [verifying, setVerifying] = React.useState(false)
      const [email, setEmail] = React.useState('')
      const [code, setCode] = React.useState('')
      const router = useRouter()

      async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!isLoaded && !signIn) return null

        try {
          // Start the sign-in process using the email code method
          const { supportedFirstFactors } = await signIn.create({
            identifier: email,
          })

          // Filter the returned array to find the 'email_code' entry
          const isEmailCodeFactor = (factor: SignInFirstFactor): factor is EmailCodeFactor => {
            return factor.strategy === 'email_code'
          }
          const emailCodeFactor = supportedFirstFactors?.find(isEmailCodeFactor)

          if (emailCodeFactor) {
            // Grab the emailAddressId
            const { emailAddressId } = emailCodeFactor

            // Send the OTP code to the user
            await signIn.prepareFirstFactor({
              strategy: 'email_code',
              emailAddressId,
            })

            // Set verifying to true to display second form
            // and capture the OTP code
            setVerifying(true)
          }
        } catch (err) {
          // See https://clerk.com/docs/guides/development/custom-flows/error-handling
          // for more info on error handling
          console.error('Error:', JSON.stringify(err, null, 2))
        }
      }

      async function handleVerification(e: React.FormEvent) {
        e.preventDefault()

        if (!isLoaded && !signIn) return null

        try {
          // Use the code provided by the user and attempt verification
          const signInAttempt = await signIn.attemptFirstFactor({
            strategy: 'email_code',
            code,
          })

          // If verification was completed, set the session to active
          // and redirect the user
          if (signInAttempt.status === 'complete') {
            await setActive({
              session: signInAttempt.createdSessionId,
              navigate: async ({ session }) => {
                if (session?.currentTask) {
                  // Check for tasks and navigate to custom UI to help users resolve them
                  // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                  console.log(session?.currentTask)
                  return
                }

                router.push('/')
              },
            })
          } else {
            // If the status is not complete, check why. User may need to
            // complete further steps.
            console.error(signInAttempt)
          }
        } catch (err) {
          // See https://clerk.com/docs/guides/development/custom-flows/error-handling
          // for more info on error handling
          console.error('Error:', JSON.stringify(err, null, 2))
        }
      }

      if (verifying) {
        return (
          <>
            <h1>Verify your email address</h1>
            <form onSubmit={handleVerification}>
              <label htmlFor="code">Enter your email verification code</label>
              <input value={code} id="code" name="code" onChange={(e) => setCode(e.target.value)} />
              <button type="submit">Verify</button>
            </form>
          </>
        )
      }

      return (
        <>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Enter email address</label>
            <input
              value={email}
              id="email"
              name="email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">Continue</button>
          </form>

          {errors && (
            <ul>
              {errors.map((el, index) => (
                <li key={index}>{el.longMessage}</li>
              ))}
            </ul>
          )}
        </>
      )
    }

    export default function SignInForm() {
      const { isLoaded, signIn, setActive } = useSignIn()
      const [email, setEmail] = React.useState('')
      const [password, setPassword] = React.useState('')
      const [errors, setErrors] = React.useState<ClerkAPIError[]>()

      const router = useRouter()

      // Handle the submission of the sign-in form
      const handleSignInWithPassword = async (e: React.FormEvent) => {
        e.preventDefault()

        // Clear any errors that may have occurred during previous form submission
        setErrors(undefined)

        if (!isLoaded) {
          return
        }

        // Start the sign-in process using the email and password provided
        try {
          const signInAttempt = await signIn.create({
            identifier: email,
            password,
          })

          // If sign-in process is complete, set the created session as active
          // and redirect the user
          if (signInAttempt.status === 'complete') {
            await setActive({
              session: signInAttempt.createdSessionId,
              navigate: async ({ session }) => {
                if (session?.currentTask) {
                  // Check for tasks and navigate to custom UI to help users resolve them
                  // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                  console.log(session?.currentTask)
                  return
                }

                router.push('/')
              },
            })
          } else {
            // If the status is not complete, check why. User may need to
            // complete further steps.
            console.error(JSON.stringify(signInAttempt, null, 2))
          }
        } catch (err) {
          if (isClerkAPIResponseError(err)) setErrors(err.errors)
          console.error(JSON.stringify(err, null, 2))
        }
      }

      if (errors && errors[0].code === 'form_password_compromised') {
        return (
          <>
            <h1>Sign in</h1>

            <p>
              Your password appears to have been compromised or it&apos;s no longer trusted and cannot
              be used. Please use email code to continue.
            </p>

            <SignInWithEmailCode />
          </>
        )
      }

      // Display a form to capture the user's email and password
      return (
        <>
          <h1>Sign in</h1>

          <form onSubmit={(e) => handleSignInWithPassword(e)}>
            <div>
              <label htmlFor="email">Enter email address</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                type="email"
                value={email}
              />
            </div>
            <div>
              <label htmlFor="password">Enter password</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                name="password"
                type="password"
                value={password}
              />
            </div>
            <button type="submit">Sign in</button>
          </form>

          {errors && (
            <ul>
              {errors.map((el, index) => (
                <li key={index}>{el.longMessage}</li>
              ))}
            </ul>
          )}
        </>
      )
    }
    ```
  </Tab>
</Tabs>


-----------

---
title: Sign-in-or-up custom flow
description: Learn how to handle a combined sign-up and sign-in flow in your application.
search:
  keywords:
    - combined
lastUpdated: 2026-02-06T22:48:01.000Z
sdkScoped: "false"
canonical: /docs/guides/development/custom-flows/authentication/sign-in-or-up
sourceFile: /docs/guides/development/custom-flows/authentication/sign-in-or-up.mdx
---

> \[!WARNING]
> This guide is for users who want to build a <Tooltip><TooltipTrigger>custom flow</TooltipTrigger><TooltipContent>A **custom flow** refers to a user interface built entirely from scratch using the Clerk API. Learn more about [custom flows](/docs/guides/development/custom-flows/overview).</TooltipContent></Tooltip>. To use a *prebuilt* UI, use the [Account Portal pages](/docs/guides/account-portal/overview) or <SDKLink href="/docs/:sdk:/reference/components/overview" sdks={["react","nextjs","js-frontend","chrome-extension","expo","expressjs","fastify","react-router","remix","tanstack-react-start","go","astro","nuxt","vue","ruby","js-backend"]}>prebuilt components</SDKLink>.

This guide demonstrates how to build a custom user interface that **allows users to sign up or sign in within a single flow**. It uses email and password authentication, but you can modify this approach according to the needs of your application.

## Enable email and password authentication

To use email and password authentication, you first need to ensure they are enabled for your application.

1. In the Clerk Dashboard, navigate to the [**User & authentication**](https://dashboard.clerk.com/last-active?path=user-authentication/user-and-authentication) page.
2. Enable **Sign-up with email** and **Sign-in with email**.
3. Select the **Password** tab and enable **Sign-up with password**. Leave **Require a password at sign-up** enabled.

> \[!NOTE]
> By default, **Email verification code** is enabled for both sign-up and sign-in. This means that when a user signs up using their email address, Clerk sends a one-time code to their email address. The user must then enter this code to verify their email and complete the sign-up process. When the user uses the email address to sign in, they are emailed a one-time code to sign in. If you'd like to use **Email verification link** instead, see the [custom flow for email links](/docs/guides/development/custom-flows/authentication/email-links).

## Sign-in-or-up flow

Because this guide uses email and password authentication, the example uses the code examples from the [email/password custom flow](/docs/guides/development/custom-flows/authentication/email-password) guide. If you are using a different authentication method, such as [email or SMS OTP](/docs/guides/development/custom-flows/authentication/email-sms-otp) or [email links](/docs/guides/development/custom-flows/authentication/email-links), you will need to adapt the code accordingly.

To blend a sign-up and sign-in flow into a single flow, you must treat it as a sign-in flow, but with the ability to sign up a new user if they don't have an account. You can do this by **checking for the `form_identifier_not_found` error** if the sign-in process fails, and then starting the sign-up process.

<Tabs items={["Next.js"]}>
  <Tab>
    ```tsx {{ filename: 'app/sign-in/page.tsx', collapsible: true }}
    'use client'

    import * as React from 'react'
    import { useSignIn, useSignUp } from '@clerk/nextjs'
    import { useRouter } from 'next/navigation'
    import type { EmailCodeFactor } from '@clerk/types'

    export default function SignInForm() {
      const { isLoaded, signIn, setActive } = useSignIn()
      const { signUp } = useSignUp()
      const [email, setEmail] = React.useState('')
      const [password, setPassword] = React.useState('')
      const [code, setCode] = React.useState('')
      const [showEmailCode, setShowEmailCode] = React.useState(false)
      const router = useRouter()

      // Handle the submission of the form
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isLoaded) return

        // Start the sign-in process using the email and password provided
        // If the user is not signed up yet, this will catch the `form_identifier_not_found` error
        try {
          const signInAttempt = await signIn.create({
            identifier: email,
            password,
          })

          // If sign-in process is complete, set the created session as active
          // and redirect the user
          if (signInAttempt.status === 'complete') {
            await setActive({
              session: signInAttempt.createdSessionId,
              navigate: async ({ session }) => {
                if (session?.currentTask) {
                  // Check for tasks and navigate to custom UI to help users resolve them
                  // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                  console.log(session?.currentTask)
                  return
                }

                router.push('/')
              },
            })
          } else if (signInAttempt.status === 'needs_second_factor') {
            // Check if email_code is a valid second factor
            // This is required when Client Trust is enabled and the user
            // is signing in from a new device.
            // See https://clerk.com/docs/guides/secure/client-trust
            const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
              (factor): factor is EmailCodeFactor => factor.strategy === 'email_code',
            )

            if (emailCodeFactor) {
              await signIn.prepareSecondFactor({
                strategy: 'email_code',
                emailAddressId: emailCodeFactor.emailAddressId,
              })

              // Display second form to capture the verification code
              setShowEmailCode(true)
            }
          } else {
            // If the status is not complete, check why. User may need to
            // complete further steps.
            console.error(JSON.stringify(signInAttempt, null, 2))
          }
        } catch (err: any) {
          // See https://clerk.com/docs/guides/development/custom-flows/error-handling
          // for more info on error handling
          console.error(JSON.stringify(err, null, 2))

          // If the identifier is not found, the user is not signed up yet
          // So this includes the flow for signing up a new user
          if (err.errors[0].code === 'form_identifier_not_found') {
            // Start the sign-up process using the email and password provided
            try {
              await signUp?.create({
                emailAddress: email,
                password,
              })

              // Send the user an email with the verification code
              await signUp?.prepareEmailAddressVerification({
                strategy: 'email_code',
              })

              // Display second form to capture the verification code
              setShowEmailCode(true)
            } catch (err: any) {
              // See https://clerk.com/docs/guides/development/custom-flows/error-handling
              // for more info on error handling
              console.error(JSON.stringify(err, null, 2))
            }
          }
        }
      }

      // Handle the submission of the email verification code
      const handleEmailCode = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isLoaded) return

        // Flow for signing up a new user
        if (signUp) {
          try {
            // Use the code the user provided to attempt verification
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
              code,
            })

            // If verification was completed, set the session to active
            // and redirect the user
            if (signUpAttempt.status === 'complete') {
              await setActive({
                session: signUpAttempt.createdSessionId,
                navigate: async ({ session }) => {
                  if (session?.currentTask) {
                    // Check for session tasks and navigate to custom UI to help users resolve them
                    // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                    console.log(session?.currentTask)
                    return
                  }

                  router.push('/')
                },
              })
            } else {
              // If the status is not complete, check why. User may need to
              // complete further steps.
              console.error('Sign-up attempt not complete:', signUpAttempt)
              console.error('Sign-up attempt status:', signUpAttempt.status)
            }
          } catch (err: any) {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
          }
        }

        // Flow for signing in an existing user
        try {
          const signInAttempt = await signIn.attemptSecondFactor({
            strategy: 'email_code',
            code,
          })

          if (signInAttempt.status === 'complete') {
            await setActive({
              session: signInAttempt.createdSessionId,
              navigate: async ({ session }) => {
                // Check for tasks and navigate to custom UI to help users resolve them
                // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                if (session?.currentTask) {
                  console.log(session?.currentTask)
                  return
                }

                router.push('/')
              },
            })
          } else {
            // If the status is not complete, check why. User may need to
            // complete further steps.
            console.error('Sign-up attempt not complete:', signInAttempt)
            console.error('Sign-up attempt status:', signInAttempt.status)
          }
        } catch (err: any) {
          console.error(JSON.stringify(err, null, 2))
        }
      }

      // Display email code verification form
      if (showEmailCode) {
        return (
          <>
            <h1>Verify your email</h1>
            <p>A verification code has been sent to your email.</p>
            <form onSubmit={handleEmailCode}>
              <div>
                <label htmlFor="code">Enter verification code</label>
                <input
                  onChange={(e) => setCode(e.target.value)}
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                />
              </div>
              <button type="submit">Verify</button>
            </form>
          </>
        )
      }

      // Display a form to capture the user's email and password
      return (
        <>
          <h1>Sign up/sign in</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Enter email address</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                name="email"
                type="email"
                value={email}
              />
            </div>
            <div>
              <label htmlFor="password">Enter password</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                name="password"
                type="password"
                value={password}
              />
            </div>
            <button type="submit">Continue</button>
          </form>

          {/* Required for sign-up flows
      Clerk's bot sign-up protection is enabled by default */}
          <div id="clerk-captcha" />
        </>
      )
    }
    ```
  </Tab>
</Tabs>


------
---
title: Build a custom email/password authentication flow
description: Learn how to build a custom email/password sign-up and sign-in flow
  using the Clerk API.
lastUpdated: 2026-02-10T20:55:59.000Z
sdkScoped: "false"
canonical: /docs/guides/development/custom-flows/authentication/email-password
sourceFile: /docs/guides/development/custom-flows/authentication/email-password.mdx
---

> \[!WARNING]
> This guide is for users who want to build a <Tooltip><TooltipTrigger>custom flow</TooltipTrigger><TooltipContent>A **custom flow** refers to a user interface built entirely from scratch using the Clerk API. Learn more about [custom flows](/docs/guides/development/custom-flows/overview).</TooltipContent></Tooltip>. To use a *prebuilt* UI, use the [Account Portal pages](/docs/guides/account-portal/overview) or <SDKLink href="/docs/:sdk:/reference/components/overview" sdks={["react","nextjs","js-frontend","chrome-extension","expo","expressjs","fastify","react-router","remix","tanstack-react-start","go","astro","nuxt","vue","ruby","js-backend"]}>prebuilt components</SDKLink>.

This guide will walk you through how to build a custom email/password sign-up and sign-in flow.

<Steps>
  ## Enable email and password authentication

  To use email and password authentication, you first need to ensure they are enabled for your application.

  1. In the Clerk Dashboard, navigate to the [**User & authentication**](https://dashboard.clerk.com/~/user-authentication/user-and-authentication) page.
  2. Enable **Sign-up with email** and **Sign-in with email**.
  3. Select the **Password** tab and enable **Sign-up with password**. Leave **Require a password at sign-up** enabled.

  > \[!NOTE]
  > By default, **Email verification code** is enabled for both sign-up and sign-in. This means that when a user signs up using their email address, Clerk sends an <Tooltip><TooltipTrigger>OTP</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip> to their email address. The user must then enter this code to verify their email and complete the sign-up process. When the user uses the email address to sign in, they are emailed an OTP to sign in. If you'd like to use **Email verification link** instead, see the [custom flow for email links](/docs/guides/development/custom-flows/authentication/email-links).

  ## Sign-up flow

  To sign up a user using their email, password, and email verification code, you must:

  1. Initiate the sign-up process by collecting the user's email address and password.
  2. Prepare the email address verification, which sends an <Tooltip><TooltipTrigger>OTP</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip> to the given address.
  3. Collect the OTP and attempt to complete the email address verification with it.
  4. If the email address verification is successful, set the newly created session as the active session. You may need to check for <Tooltip><TooltipTrigger>session tasks</TooltipTrigger><TooltipContent>**Session tasks** are requirements that users must fulfill in order to complete the authentication process, such as choosing an Organization.</TooltipContent></Tooltip> that are required for the user to complete after signing up.

  <Tabs items={["Next.js", "JavaScript", "Expo", "iOS", "Android"]}>
    <Tab>
      This example is written for Next.js App Router but it can be adapted for any React-based framework.

      ```tsx {{ filename: 'app/sign-up/[[...sign-up]]/page.tsx', collapsible: true }}
      'use client'

      import * as React from 'react'
      import { useSignUp } from '@clerk/nextjs'
      import { useRouter } from 'next/navigation'

      export default function Page() {
        const { isLoaded, signUp, setActive } = useSignUp()
        const [emailAddress, setEmailAddress] = React.useState('')
        const [password, setPassword] = React.useState('')
        const [verifying, setVerifying] = React.useState(false)
        const [code, setCode] = React.useState('')
        const router = useRouter()

        // Handle submission of the sign-up form
        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()

          if (!isLoaded) return <div>Loading...</div>

          // Start the sign-up process using the email and password provided
          try {
            await signUp.create({
              emailAddress,
              password,
            })

            // Send the user an email with the verification code
            await signUp.prepareEmailAddressVerification({
              strategy: 'email_code',
            })

            // Set 'verifying' true to display second form
            // and capture the code
            setVerifying(true)
          } catch (err: any) {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
          }
        }

        // Handle the submission of the verification form
        const handleVerify = async (e: React.FormEvent) => {
          e.preventDefault()

          if (!isLoaded) return <div>Loading...</div>

          try {
            // Use the code the user provided to attempt verification
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
              code,
            })

            // If verification was completed, set the session to active
            // and redirect the user
            if (signUpAttempt.status === 'complete') {
              await setActive({
                session: signUpAttempt.createdSessionId,
                navigate: async ({ session }) => {
                  if (session?.currentTask) {
                    // Check for session tasks and navigate to custom UI to help users resolve them
                    // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                    console.log(session?.currentTask)
                    return
                  }

                  router.push('/')
                },
              })
            } else {
              // If the status is not complete, check why. User may need to
              // complete further steps.
              console.error('Sign-up attempt not complete:', signUpAttempt)
              console.error('Sign-up attempt status:', signUpAttempt.status)
            }
          } catch (err: any) {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
          }
        }

        // Display the verification form to capture the code
        if (verifying) {
          return (
            <>
              <h1>Verify your email</h1>
              <form onSubmit={handleVerify}>
                <label id="code">Enter your verification code</label>
                <input value={code} id="code" name="code" onChange={(e) => setCode(e.target.value)} />
                <button type="submit">Verify</button>
              </form>
            </>
          )
        }

        // Display the initial sign-up form to capture the email and password
        return (
          <>
            <h1>Sign up</h1>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email">Enter email address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password">Enter password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Required for sign-up flows
              Clerk's bot sign-up protection is enabled by default */}
              <div id="clerk-captcha" />

              <div>
                <button type="submit">Continue</button>
              </div>
            </form>
          </>
        )
      }
      ```
    </Tab>

    <Tab>
      <CodeBlockTabs options={["index.html", "main.js"]}>
        ```html {{ filename: 'index.html', collapsible: true }}
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Clerk + JavaScript App</title>
          </head>
          <body>
            <div id="signed-in"></div>

            <div id="sign-up">
              <h2>Sign up</h2>
              <form id="sign-up-form">
                <label for="email">Enter email address</label>
                <input type="email" name="email" id="sign-up-email" />
                <label for="password">Enter password</label>
                <input type="password" name="password" id="sign-up-password" />
                <button type="submit">Continue</button>
              </form>
            </div>

            <form id="verifying" hidden>
              <h2>Verify your email</h2>
              <label for="code">Enter your verification code</label>
              <input id="code" name="code" />
              <button type="submit" id="verify-button">Verify</button>
            </form>

            <script type="module" src="/src/main.js" async crossorigin="anonymous"></script>
          </body>
        </html>
        ```

        ```js {{ filename: 'main.js', collapsible: true }}
        import { Clerk } from '@clerk/clerk-js'

        const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

        const clerk = new Clerk(pubKey)
        await clerk.load()

        if (clerk.isSignedIn) {
          // Mount user button component
          document.getElementById('signed-in').innerHTML = `
            <div id="user-button"></div>
          `

          const userbuttonDiv = document.getElementById('user-button')

          clerk.mountUserButton(userbuttonDiv)
        } else {
          // Handle the sign-up form
          document.getElementById('sign-up-form').addEventListener('submit', async (e) => {
            e.preventDefault()

            const formData = new FormData(e.target)
            const emailAddress = formData.get('email')
            const password = formData.get('password')

            try {
              // Start the sign-up process using the email and password provided
              await clerk.client.signUp.create({ emailAddress, password })
              await clerk.client.signUp.prepareEmailAddressVerification()
              // Hide sign-up form
              document.getElementById('sign-up').setAttribute('hidden', '')
              // Show verification form
              document.getElementById('verifying').removeAttribute('hidden')
            } catch (error) {
              // See https://clerk.com/docs/guides/development/custom-flows/error-handling
              // for more info on error handling
              console.error(error)
            }
          })

          // Handle the verification form
          document.getElementById('verifying').addEventListener('submit', async (e) => {
            const formData = new FormData(e.target)
            const code = formData.get('code')

            try {
              // Use the code the user provided to attempt verification
              const signUpAttempt = await clerk.client.signUp.attemptEmailAddressVerification({
                code,
              })

              // Now that the user is created, set the session to active.
              await clerk.setActive({ session: signUpAttempt.createdSessionId })
            } catch (error) {
              // See https://clerk.com/docs/guides/development/custom-flows/error-handling
              // for more info on error handling
              console.error(error)
            }
          })
        }
        ```
      </CodeBlockTabs>
    </Tab>

    <Tab>
      1. Create the `(auth)` route group. This groups your sign-up and sign-in pages.
      2. In the `(auth)` group, create a `_layout.tsx` file with the following code. The <SDKLink href="/docs/:sdk:/reference/hooks/use-auth" sdks={["astro","chrome-extension","expo","nextjs","react","react-router","tanstack-react-start"]} code={true}>useAuth()</SDKLink> hook is used to access the user's authentication state. If the user's already signed in, they'll be redirected to the home page.

      ```tsx {{ filename: 'app/(auth)/_layout.tsx' }}
      import { Redirect, Stack } from 'expo-router'
      import { useAuth } from '@clerk/clerk-expo'

      export default function GuestLayout() {
        const { isSignedIn } = useAuth()

        if (isSignedIn) {
          return <Redirect href={'/dashboard'} />
        }

        return <Stack />
      }
      ```

      In the `(auth)` group, create a `sign-up.tsx` file with the following code. The <SDKLink href="/docs/:sdk:/reference/hooks/use-sign-up" sdks={["chrome-extension","expo","nextjs","react","react-router","tanstack-react-start"]} code={true}>useSignUp()</SDKLink> hook is used to create a sign-up flow. The user can sign up using their email and password and will receive an email verification code to confirm their email.

      ```tsx {{ filename: 'app/(auth)/sign-up.tsx', collapsible: true }}
      import { ThemedText } from '@/components/themed-text'
      import { ThemedView } from '@/components/themed-view'
      import { useSignUp } from '@clerk/clerk-expo'
      import { Link, useRouter } from 'expo-router'
      import * as React from 'react'
      import { Pressable, StyleSheet, TextInput, View } from 'react-native'

      export default function Page() {
        const { isLoaded, signUp, setActive } = useSignUp()
        const router = useRouter()

        const [emailAddress, setEmailAddress] = React.useState('')
        const [password, setPassword] = React.useState('')
        const [pendingVerification, setPendingVerification] = React.useState(false)
        const [code, setCode] = React.useState('')

        // Handle submission of sign-up form
        const onSignUpPress = async () => {
          if (!isLoaded) return

          // Start sign-up process using email and password provided
          try {
            await signUp.create({
              emailAddress,
              password,
            })

            // Send user an email with verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            // Set 'pendingVerification' to true to display second form
            // and capture code
            setPendingVerification(true)
          } catch (err) {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
          }
        }

        // Handle submission of verification form
        const onVerifyPress = async () => {
          if (!isLoaded) return

          try {
            // Use the code the user provided to attempt verification
            const signUpAttempt = await signUp.attemptEmailAddressVerification({
              code,
            })

            // If verification was completed, set the session to active
            // and redirect the user
            if (signUpAttempt.status === 'complete') {
              await setActive({
                session: signUpAttempt.createdSessionId,
                navigate: async ({ session }) => {
                  if (session?.currentTask) {
                    // Check for tasks and navigate to custom UI to help users resolve them
                    // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                    console.log(session?.currentTask)
                    return
                  }

                  router.replace('/')
                },
              })
            } else {
              // If the status is not complete, check why. User may need to
              // complete further steps.
              console.error(JSON.stringify(signUpAttempt, null, 2))
            }
          } catch (err) {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
          }
        }

        if (pendingVerification) {
          return (
            <ThemedView style={styles.container}>
              <ThemedText type="title" style={styles.title}>
                Verify your email
              </ThemedText>
              <ThemedText style={styles.description}>
                A verification code has been sent to your email.
              </ThemedText>
              <TextInput
                style={styles.input}
                value={code}
                placeholder="Enter your verification code"
                placeholderTextColor="#666666"
                onChangeText={(code) => setCode(code)}
                keyboardType="numeric"
              />
              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={onVerifyPress}
              >
                <ThemedText style={styles.buttonText}>Verify</ThemedText>
              </Pressable>
            </ThemedView>
          )
        }

        return (
          <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              Sign up
            </ThemedText>
            <ThemedText style={styles.label}>Email address</ThemedText>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              placeholderTextColor="#666666"
              onChangeText={(email) => setEmailAddress(email)}
              keyboardType="email-address"
            />
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={styles.input}
              value={password}
              placeholder="Enter password"
              placeholderTextColor="#666666"
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
            />
            <Pressable
              style={({ pressed }) => [
                styles.button,
                (!emailAddress || !password) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={onSignUpPress}
              disabled={!emailAddress || !password}
            >
              <ThemedText style={styles.buttonText}>Continue</ThemedText>
            </Pressable>
            <View style={styles.linkContainer}>
              <ThemedText>Have an account? </ThemedText>
              <Link href="/sign-in">
                <ThemedText type="link">Sign in</ThemedText>
              </Link>
            </View>
          </ThemedView>
        )
      }

      const styles = StyleSheet.create({
        container: {
          flex: 1,
          padding: 20,
          gap: 12,
        },
        title: {
          marginBottom: 8,
        },
        description: {
          fontSize: 14,
          marginBottom: 16,
          opacity: 0.8,
        },
        label: {
          fontWeight: '600',
          fontSize: 14,
        },
        input: {
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          backgroundColor: '#fff',
        },
        button: {
          backgroundColor: '#0a7ea4',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 8,
        },
        buttonPressed: {
          opacity: 0.7,
        },
        buttonDisabled: {
          opacity: 0.5,
        },
        buttonText: {
          color: '#fff',
          fontWeight: '600',
        },
        linkContainer: {
          flexDirection: 'row',
          gap: 4,
          marginTop: 12,
          alignItems: 'center',
        },
      })
      ```
    </Tab>

    <Tab>
      ```swift {{ filename: 'EmailPasswordSignUpView.swift', collapsible: true }}
      import SwiftUI
      import ClerkKit

      struct EmailPasswordSignUpView: View {
        @Environment(Clerk.self) private var clerk
        @State private var email = ""
        @State private var password = ""
        @State private var code = ""
        @State private var isVerifying = false

        var body: some View {
          if isVerifying {
            TextField("Enter your verification code", text: $code)
            Button("Verify") {
              Task { await verify(code: code) }
            }
          } else {
            TextField("Enter email address", text: $email)
            SecureField("Enter password", text: $password)
            Button("Next") {
              Task { await submit(email: email, password: password) }
            }
          }
        }
      }

      extension EmailPasswordSignUpView {

        func submit(email: String, password: String) async {
          do {
            // Start sign-up with email/password.
            var signUp = try await clerk.auth.signUp(
              emailAddress: email,
              password: password
            )

            // Send the email verification code.
            signUp = try await signUp.sendEmailCode()

            isVerifying = true
        } catch {
          // See https://clerk.com/docs/guides/development/custom-flows/error-handling
          // for more info on error handling.
          dump(error)
        }
      }

        func verify(code: String) async {
          do {
            // Verify the email code.
            guard var signUp = clerk.auth.currentSignUp else { return }

            signUp = try await signUp.verifyEmailCode(code)

            switch signUp.status {
            case .complete:
              dump(clerk.session)
            default:
              dump(signUp.status)
            }
          } catch {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            dump(error)
          }
        }
      }
      ```
    </Tab>

    <Tab>
      ```kotlin {{ filename: 'EmailPasswordSignUpViewModel.kt', collapsible: true }}
        import androidx.lifecycle.ViewModel
        import androidx.lifecycle.viewModelScope
        import com.clerk.api.Clerk
        import com.clerk.api.network.serialization.flatMap
        import com.clerk.api.network.serialization.onFailure
        import com.clerk.api.network.serialization.onSuccess
        import com.clerk.api.signup.SignUp
        import com.clerk.api.signup.attemptVerification
        import com.clerk.api.signup.prepareVerification
        import kotlinx.coroutines.flow.MutableStateFlow
        import kotlinx.coroutines.flow.asStateFlow
        import kotlinx.coroutines.flow.combine
        import kotlinx.coroutines.flow.launchIn
        import kotlinx.coroutines.launch

        class EmailPasswordSignUpViewModel : ViewModel() {
          private val _uiState =
            MutableStateFlow<UiState>(UiState.Loading)
          val uiState = _uiState.asStateFlow()

          init {
            combine(Clerk.userFlow, Clerk.isInitialized) { user, isInitialized ->
                _uiState.value =
                  when {
                    !isInitialized -> UiState.Loading
                    user != null -> UiState.Verified
                    else -> UiState.Unverified
                  }
              }
              .launchIn(viewModelScope)
          }

          fun submit(email: String, password: String) {
            viewModelScope.launch {
              SignUp.create(SignUp.CreateParams.Standard(emailAddress = email, password = password))
                .flatMap { it.prepareVerification(SignUp.PrepareVerificationParams.Strategy.EmailCode()) }
                .onSuccess { _uiState.value = UiState.Verifying }
                .onFailure {
                  // See https://clerk.com/docs/guides/development/custom-flows/error-handling
                  // for more info on error handling
                }
            }
          }

          fun verify(code: String) {
            val inProgressSignUp = Clerk.signUp ?: return
            viewModelScope.launch {
              inProgressSignUp
                .attemptVerification(SignUp.AttemptVerificationParams.EmailCode(code))
                .onSuccess { _uiState.value = UiState.Verified }
                .onFailure {
                  // See https://clerk.com/docs/guides/development/custom-flows/error-handling
                  // for more info on error handling
                }
            }
          }

          sealed interface UiState {
            data object Loading : UiState

            data object Unverified : UiState

            data object Verifying : UiState

            data object Verified : UiState
          }
        }
      ```

      ```kotlin {{ filename: 'EmailPasswordSignUpActivity.kt', collapsible: true }}
      import android.os.Bundle
      import androidx.activity.ComponentActivity
      import androidx.activity.compose.setContent
      import androidx.activity.viewModels
      import androidx.compose.foundation.layout.Arrangement
      import androidx.compose.foundation.layout.Box
      import androidx.compose.foundation.layout.Column
      import androidx.compose.foundation.layout.fillMaxSize
      import androidx.compose.material3.Button
      import androidx.compose.material3.CircularProgressIndicator
      import androidx.compose.material3.Text
      import androidx.compose.material3.TextField
      import androidx.compose.runtime.Composable
      import androidx.compose.runtime.getValue
      import androidx.compose.runtime.mutableStateOf
      import androidx.compose.runtime.remember
      import androidx.compose.runtime.setValue
      import androidx.compose.ui.Alignment
      import androidx.compose.ui.Modifier
      import androidx.compose.ui.text.input.PasswordVisualTransformation
      import androidx.compose.ui.unit.dp
      import androidx.lifecycle.compose.collectAsStateWithLifecycle

      class EmailPasswordSignUpActivity : ComponentActivity() {

        val viewModel: EmailPasswordSignUpViewModel by viewModels()

        override fun onCreate(savedInstanceState: Bundle?) {
          super.onCreate(savedInstanceState)
          setContent {
            val state by viewModel.uiState.collectAsStateWithLifecycle()
            EmailPasswordSignInView(
              state = state,
              onSubmit = viewModel::submit,
              onVerify = viewModel::verify,
            )
          }
        }
      }

      @Composable
      fun EmailPasswordSignInView(
        state: EmailPasswordSignUpViewModel.UiState,
        onSubmit: (String, String) -> Unit,
        onVerify: (String) -> Unit,
      ) {
        var email by remember { mutableStateOf("") }
        var password by remember { mutableStateOf("") }
        var code by remember { mutableStateOf("") }

        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
          when (state) {
            EmailPasswordSignUpViewModel.UiState.Unverified -> {
              Column(
                verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically),
                horizontalAlignment = Alignment.CenterHorizontally,
              ) {
                TextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
                TextField(
                  value = password,
                  onValueChange = { password = it },
                  visualTransformation = PasswordVisualTransformation(),
                  label = { Text("Password") },
                )
                Button(onClick = { onSubmit(email, password) }) { Text("Next") }
              }
            }
            EmailPasswordSignUpViewModel.UiState.Verified -> {
              Text("Verified!")
            }
            EmailPasswordSignUpViewModel.UiState.Verifying -> {
              Column(
                verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically),
                horizontalAlignment = Alignment.CenterHorizontally,
              ) {
                TextField(
                  value = code,
                  onValueChange = { code = it },
                  label = { Text("Enter your verification code") },
                )
                Button(onClick = { onVerify(code) }) { Text("Verify") }
              }
            }
            EmailPasswordSignUpViewModel.UiState.Loading -> CircularProgressIndicator()
          }
        }
      }
      ```
    </Tab>
  </Tabs>

  ## Sign-in flow

  To authenticate a user using their email and password, you must:

  1. Initiate the sign-in process by creating a `SignIn` using the email address and password provided.
  2. Check if the sign-in requires a <Tooltip><TooltipTrigger>second factor</TooltipTrigger><TooltipContent>A **second factor** is an additional factor of authentication that is required to complete the authentication process. For example, if a user signs in with their email and password, and then is asked to also provide an <Tooltip><TooltipTrigger>OTP</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip> sent to their email in order to verify their identity, the email OTP is the second factor.</TooltipContent></Tooltip>. [Client Trust](/docs/guides/secure/client-trust), which is enabled by default for new Clerk applications, may require users to verify their identity with a <Tooltip><TooltipTrigger>one-time password (OTP)</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip> sent to their email when signing in from a new device.
  3. If a <Tooltip><TooltipTrigger>second factor</TooltipTrigger><TooltipContent>A **second factor** is an additional factor of authentication that is required to complete the authentication process. For example, if a user signs in with their email and password, and then is asked to also provide an <Tooltip><TooltipTrigger>OTP</TooltipTrigger><TooltipContent>A **one-time password (OTP)** is a code that is used to authenticate a user. The OTP is typically sent to a user's email address or phone number and must be entered within a certain time period to be valid.</TooltipContent></Tooltip> sent to their email in order to verify their identity, the email OTP is the second factor.</TooltipContent></Tooltip> is required, prepare the email code verification and collect the code from the user.
  4. Attempt to verify the code.
  5. If the attempt is successful, set the newly created session as the active session.

  <Tabs items={["Next.js", "JavaScript", "Expo", "iOS", "Android"]}>
    <Tab>
      This example is written for Next.js App Router but it can be adapted for any React-based framework.

      ```tsx {{ filename: 'app/sign-in/[[...sign-in]]/page.tsx', collapsible: true }}
      'use client'

      import * as React from 'react'
      import { useSignIn } from '@clerk/nextjs'
      import { useRouter } from 'next/navigation'
      import type { EmailCodeFactor } from '@clerk/types'

      export default function SignInForm() {
        const { isLoaded, signIn, setActive } = useSignIn()
        const [email, setEmail] = React.useState('')
        const [password, setPassword] = React.useState('')
        const [code, setCode] = React.useState('')
        const [showEmailCode, setShowEmailCode] = React.useState(false)
        const router = useRouter()

        // Handle the submission of the sign-in form
        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()

          if (!isLoaded) return

          // Start the sign-in process using the email and password provided
          try {
            const signInAttempt = await signIn.create({
              identifier: email,
              password,
            })

            // If sign-in process is complete, set the created session as active
            // and redirect the user
            if (signInAttempt.status === 'complete') {
              await setActive({
                session: signInAttempt.createdSessionId,
                navigate: async ({ session }) => {
                  if (session?.currentTask) {
                    // Check for tasks and navigate to custom UI to help users resolve them
                    // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                    console.log(session?.currentTask)
                    return
                  }

                  router.push('/')
                },
              })
            } else if (signInAttempt.status === 'needs_second_factor') {
              // Check if email_code is a valid second factor
              // This is required when Client Trust is enabled and the user
              // is signing in from a new device.
              // See https://clerk.com/docs/guides/secure/client-trust
              const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
                (factor): factor is EmailCodeFactor => factor.strategy === 'email_code',
              )

              if (emailCodeFactor) {
                await signIn.prepareSecondFactor({
                  strategy: 'email_code',
                  emailAddressId: emailCodeFactor.emailAddressId,
                })
                setShowEmailCode(true)
              }
            } else {
              // If the status is not complete, check why. User may need to
              // complete further steps.
              console.error(JSON.stringify(signInAttempt, null, 2))
            }
          } catch (err: any) {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
          }
        }

        // Handle the submission of the email verification code
        const handleEmailCode = async (e: React.FormEvent) => {
          e.preventDefault()

          if (!isLoaded) return

          try {
            const signInAttempt = await signIn.attemptSecondFactor({
              strategy: 'email_code',
              code,
            })

            if (signInAttempt.status === 'complete') {
              await setActive({
                session: signInAttempt.createdSessionId,
                navigate: async ({ session }) => {
                  if (session?.currentTask) {
                    console.log(session?.currentTask)
                    return
                  }

                  router.push('/')
                },
              })
            } else {
              console.error(JSON.stringify(signInAttempt, null, 2))
            }
          } catch (err: any) {
            console.error(JSON.stringify(err, null, 2))
          }
        }

        // Display email code verification form
        if (showEmailCode) {
          return (
            <>
              <h1>Verify your email</h1>
              <p>A verification code has been sent to your email.</p>
              <form onSubmit={handleEmailCode}>
                <div>
                  <label htmlFor="code">Enter verification code</label>
                  <input
                    onChange={(e) => setCode(e.target.value)}
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    value={code}
                  />
                </div>
                <button type="submit">Verify</button>
              </form>
            </>
          )
        }

        // Display a form to capture the user's email and password
        return (
          <>
            <h1>Sign in</h1>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email">Enter email address</label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                />
              </div>
              <div>
                <label htmlFor="password">Enter password</label>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                />
              </div>
              <button type="submit">Sign in</button>
            </form>
          </>
        )
      }
      ```
    </Tab>

    <Tab>
      <CodeBlockTabs options={["index.html", "main.js"]}>
        ```html {{ filename: 'index.html', collapsible: true }}
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Clerk + JavaScript App</title>
          </head>
          <body>
            <div id="signed-in"></div>

            <div id="sign-in">
              <h2>Sign in</h2>
              <form id="sign-in-form">
                <label for="email">Enter email address</label>
                <input name="email" id="sign-in-email" />
                <label for="password">Enter password</label>
                <input name="password" id="sign-in-password" />
                <button type="submit">Continue</button>
              </form>
            </div>

            <form id="email-code-form" hidden>
              <h2>Verify your email</h2>
              <p>A verification code has been sent to your email.</p>
              <label for="code">Enter verification code</label>
              <input id="code" name="code" />
              <button type="submit">Verify</button>
            </form>

            <script type="module" src="/src/main.js" async crossorigin="anonymous"></script>
          </body>
        </html>
        ```

        ```js {{ filename: 'main.js', collapsible: true }}
        import { Clerk } from '@clerk/clerk-js'

        const pubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

        const clerk = new Clerk(pubKey)
        await clerk.load()

        if (clerk.isSignedIn) {
          // Mount user button component
          document.getElementById('signed-in').innerHTML = `
            <div id="user-button"></div>
          `

          const userbuttonDiv = document.getElementById('user-button')

          clerk.mountUserButton(userbuttonDiv)
        } else if (clerk.session?.currentTask) {
          // Check for pending tasks and display custom UI to help users resolve them
          // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
          switch (clerk.session.currentTask.key) {
            case 'choose-organization': {
              document.getElementById('app').innerHTML = `
                    <div id="task"></div>
                  `

              const taskDiv = document.getElementById('task')

              clerk.mountTaskChooseOrganization(taskDiv)
            }
          }
        } else {
          // Handle the sign-in form
          document.getElementById('sign-in-form').addEventListener('submit', async (e) => {
            e.preventDefault()

            const formData = new FormData(e.target)
            const emailAddress = formData.get('email')
            const password = formData.get('password')

            try {
              // Start the sign-in process
              const signInAttempt = await clerk.client.signIn.create({
                identifier: emailAddress,
                password,
              })

              // If the sign-in is complete, set the user as active
              if (signInAttempt.status === 'complete') {
                await clerk.setActive({ session: signInAttempt.createdSessionId })

                location.reload()
              } else if (signInAttempt.status === 'needs_second_factor') {
                // Check if email_code is a valid second factor
                // This is required when Client Trust is enabled and the user
                // is signing in from a new device.
                // See https://clerk.com/docs/guides/secure/client-trust
                const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
                  (factor) => factor.strategy === 'email_code',
                )

                if (emailCodeFactor) {
                  await clerk.client.signIn.prepareSecondFactor({
                    strategy: 'email_code',
                    emailAddressId: emailCodeFactor.emailAddressId,
                  })

                  // Hide sign-in form and show email code form
                  document.getElementById('sign-in').setAttribute('hidden', '')
                  document.getElementById('email-code-form').removeAttribute('hidden')
                }
              } else {
                // If the status is not complete, check why. User may need to
                // complete further steps.
                console.error(JSON.stringify(signInAttempt, null, 2))
              }
            } catch (error) {
              // See https://clerk.com/docs/guides/development/custom-flows/error-handling
              // for more info on error handling
              console.error(error)
            }
          })

          // Handle email code verification form
          document.getElementById('email-code-form').addEventListener('submit', async (e) => {
            e.preventDefault()

            const formData = new FormData(e.target)
            const code = formData.get('code')

            try {
              const signInAttempt = await clerk.client.signIn.attemptSecondFactor({
                strategy: 'email_code',
                code,
              })

              if (signInAttempt.status === 'complete') {
                await clerk.setActive({ session: signInAttempt.createdSessionId })

                location.reload()
              } else {
                console.error(JSON.stringify(signInAttempt, null, 2))
              }
            } catch (error) {
              console.error(error)
            }
          })
        }
        ```
      </CodeBlockTabs>
    </Tab>

    <Tab>
      In the `(auth)` group, create a `sign-in.tsx` file with the following code. The <SDKLink href="/docs/:sdk:/reference/hooks/use-sign-in" sdks={["chrome-extension","expo","nextjs","react","react-router","tanstack-react-start"]} code={true}>useSignIn()</SDKLink> hook is used to create a sign-in flow. The user can sign in using email address and password, or navigate to the sign-up page.

      ```tsx {{ filename: 'app/(auth)/sign-in.tsx', collapsible: true }}
      import { ThemedText } from '@/components/themed-text'
      import { ThemedView } from '@/components/themed-view'
      import { useSignIn } from '@clerk/clerk-expo'
      import type { EmailCodeFactor } from '@clerk/types'
      import { Link, useRouter } from 'expo-router'
      import * as React from 'react'
      import { Pressable, StyleSheet, TextInput, View } from 'react-native'

      export default function Page() {
        const { signIn, setActive, isLoaded } = useSignIn()
        const router = useRouter()

        const [emailAddress, setEmailAddress] = React.useState('')
        const [password, setPassword] = React.useState('')
        const [code, setCode] = React.useState('')
        const [showEmailCode, setShowEmailCode] = React.useState(false)

        // Handle the submission of the sign-in form
        const onSignInPress = React.useCallback(async () => {
          if (!isLoaded) return

          // Start the sign-in process using the email and password provided
          try {
            const signInAttempt = await signIn.create({
              identifier: emailAddress,
              password,
            })

            // If sign-in process is complete, set the created session as active
            // and redirect the user
            if (signInAttempt.status === 'complete') {
              await setActive({
                session: signInAttempt.createdSessionId,
                navigate: async ({ session }) => {
                  if (session?.currentTask) {
                    // Check for tasks and navigate to custom UI to help users resolve them
                    // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                    console.log(session?.currentTask)
                    return
                  }

                  router.replace('/')
                },
              })
            } else if (signInAttempt.status === 'needs_second_factor') {
              // Check if email_code is a valid second factor
              // This is required when Client Trust is enabled and the user
              // is signing in from a new device.
              // See https://clerk.com/docs/guides/secure/client-trust
              const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
                (factor): factor is EmailCodeFactor => factor.strategy === 'email_code',
              )

              if (emailCodeFactor) {
                await signIn.prepareSecondFactor({
                  strategy: 'email_code',
                  emailAddressId: emailCodeFactor.emailAddressId,
                })
                setShowEmailCode(true)
              }
            } else {
              // If the status is not complete, check why. User may need to
              // complete further steps.
              console.error(JSON.stringify(signInAttempt, null, 2))
            }
          } catch (err) {
            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
          }
        }, [isLoaded, signIn, setActive, router, emailAddress, password])

        // Handle the submission of the email verification code
        const onVerifyPress = React.useCallback(async () => {
          if (!isLoaded) return

          try {
            const signInAttempt = await signIn.attemptSecondFactor({
              strategy: 'email_code',
              code,
            })

            if (signInAttempt.status === 'complete') {
              await setActive({
                session: signInAttempt.createdSessionId,
                navigate: async ({ session }) => {
                  if (session?.currentTask) {
                    // Check for tasks and navigate to custom UI to help users resolve them
                    // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
                    console.log(session?.currentTask)
                    return
                  }

                  router.replace('/')
                },
              })
            } else {
              console.error(JSON.stringify(signInAttempt, null, 2))
            }
          } catch (err) {
            console.error(JSON.stringify(err, null, 2))
          }
        }, [isLoaded, signIn, setActive, router, code])

        // Display email code verification form
        if (showEmailCode) {
          return (
            <ThemedView style={styles.container}>
              <ThemedText type="title" style={styles.title}>
                Verify your email
              </ThemedText>
              <ThemedText style={styles.description}>
                A verification code has been sent to your email.
              </ThemedText>
              <TextInput
                style={styles.input}
                value={code}
                placeholder="Enter verification code"
                placeholderTextColor="#666666"
                onChangeText={(code) => setCode(code)}
                keyboardType="numeric"
              />
              <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={onVerifyPress}
              >
                <ThemedText style={styles.buttonText}>Verify</ThemedText>
              </Pressable>
            </ThemedView>
          )
        }

        return (
          <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
              Sign in
            </ThemedText>
            <ThemedText style={styles.label}>Email address</ThemedText>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Enter email"
              placeholderTextColor="#666666"
              onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
              keyboardType="email-address"
            />
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={styles.input}
              value={password}
              placeholder="Enter password"
              placeholderTextColor="#666666"
              secureTextEntry={true}
              onChangeText={(password) => setPassword(password)}
            />
            <Pressable
              style={({ pressed }) => [
                styles.button,
                (!emailAddress || !password) && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={onSignInPress}
              disabled={!emailAddress || !password}
            >
              <ThemedText style={styles.buttonText}>Sign in</ThemedText>
            </Pressable>
            <View style={styles.linkContainer}>
              <ThemedText>Don't have an account? </ThemedText>
              <Link href="/sign-up">
                <ThemedText type="link">Sign up</ThemedText>
              </Link>
            </View>
          </ThemedView>
        )
      }

      const styles = StyleSheet.create({
        container: {
          flex: 1,
          padding: 20,
          gap: 12,
        },
        title: {
          marginBottom: 8,
        },
        description: {
          fontSize: 14,
          marginBottom: 16,
          opacity: 0.8,
        },
        label: {
          fontWeight: '600',
          fontSize: 14,
        },
        input: {
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 12,
          fontSize: 16,
          backgroundColor: '#fff',
        },
        button: {
          backgroundColor: '#0a7ea4',
          paddingVertical: 12,
          paddingHorizontal: 24,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 8,
        },
        buttonPressed: {
          opacity: 0.7,
        },
        buttonDisabled: {
          opacity: 0.5,
        },
        buttonText: {
          color: '#fff',
          fontWeight: '600',
        },
        linkContainer: {
          flexDirection: 'row',
          gap: 4,
          marginTop: 12,
          alignItems: 'center',
        },
      })
      ```
    </Tab>

    <Tab>
      ```swift {{ filename: 'EmailPasswordSignInView.swift', collapsible: true }}
      import SwiftUI
      import ClerkKit

      struct EmailPasswordSignInView: View {
        @Environment(Clerk.self) private var clerk
        @State private var email = ""
        @State private var password = ""
        @State private var code = ""
        @State private var showEmailCode = false

        var body: some View {
          if showEmailCode {
            Text("Verify your email")
            Text("A verification code has been sent to your email.")
            TextField("Enter verification code", text: $code)
            Button("Verify") {
              Task { await verify(code: code) }
            }
          } else {
            TextField("Enter email address", text: $email)
            SecureField("Enter password", text: $password)
            Button("Sign In") {
              Task { await submit(email: email, password: password) }
            }
          }
        }
      }

      extension EmailPasswordSignInView {

        func submit(email: String, password: String) async {
          do {
            // Start sign-in with email/password.
            var signIn = try await clerk.auth.signInWithPassword(
              identifier: email,
              password: password
            )

            switch signIn.status {
            case .complete:
              dump(clerk.session)
            case .needsSecondFactor:
              // This is required when Client Trust is enabled and the user
              // is signing in from a new device.
              // See https://clerk.com/docs/guides/secure/client-trust.
              signIn = try await signIn.sendMfaEmailCode()
              showEmailCode = true
            default:
              // If the status is not complete, check why. User may need to
              // complete further steps.
              dump(signIn.status)
            }
        } catch {
          // See https://clerk.com/docs/guides/development/custom-flows/error-handling
          // for more info on error handling.
          dump(error)
        }
      }

        func verify(code: String) async {
          do {
            // Verify the email code.
            guard var signIn = clerk.auth.currentSignIn else { return }

            signIn = try await signIn.verifyMfaCode(code, type: .emailCode)

            switch signIn.status {
            case .complete:
              dump(clerk.session)
            default:
              dump(signIn.status)
            }
        } catch {
          // See https://clerk.com/docs/guides/development/custom-flows/error-handling
          // for more info on error handling.
          dump(error)
        }
      }
      }
      ```
    </Tab>

    <Tab>
      ```kotlin {{ filename: 'EmailPasswordSignInViewModel.kt', collapsible: true }}
        import androidx.lifecycle.ViewModel
        import androidx.lifecycle.viewModelScope
        import com.clerk.api.Clerk
        import com.clerk.api.network.serialization.flatMap
        import com.clerk.api.network.serialization.onFailure
        import com.clerk.api.network.serialization.onSuccess
        import com.clerk.api.signin.SignIn
        import com.clerk.api.signin.prepareSecondFactor
        import com.clerk.api.signin.attemptSecondFactor
        import kotlinx.coroutines.flow.MutableStateFlow
        import kotlinx.coroutines.flow.asStateFlow
        import kotlinx.coroutines.flow.combine
        import kotlinx.coroutines.flow.launchIn
        import kotlinx.coroutines.launch

        class EmailPasswordSignInViewModel : ViewModel() {
            private val _uiState = MutableStateFlow<UiState>(
                UiState.SignedOut
            )
            val uiState = _uiState.asStateFlow()

            init {
                combine(Clerk.userFlow, Clerk.isInitialized) { user, isInitialized ->
                    _uiState.value = when {
                        !isInitialized -> UiState.Loading
                        user == null -> UiState.SignedOut
                        else -> UiState.SignedIn
                    }
                }.launchIn(viewModelScope)
            }

            fun submit(email: String, password: String) {
                viewModelScope.launch {
                    SignIn.create(
                        SignIn.CreateParams.Strategy.Password(
                            identifier = email,
                            password = password
                        )
                    ).onSuccess { signIn ->
                        when (signIn.status) {
                            SignIn.Status.COMPLETE -> {
                                _uiState.value = UiState.SignedIn
                            }
                            SignIn.Status.NEEDS_SECOND_FACTOR -> {
                                // Check if email_code is a valid second factor
                                // This is required when Client Trust is enabled and the user
                                // is signing in from a new device.
                                // See https://clerk.com/docs/guides/secure/client-trust
                                val hasEmailCode = signIn.supportedSecondFactors?.any {
                                    it.strategy == "email_code"
                                } == true
                                if (hasEmailCode) {
                                    signIn.prepareSecondFactor(
                                        SignIn.PrepareSecondFactorParams.EmailCode()
                                    ).onSuccess {
                                        _uiState.value = UiState.NeedsEmailCode
                                    }
                                }
                            }
                            else -> {
                                // If the status is not complete, check why. User may need to
                                // complete further steps.
                            }
                        }
                    }.onFailure {
                        // See https://clerk.com/docs/guides/development/custom-flows/error-handling
                        // for more info on error handling
                    }
                }
            }

            fun verify(code: String) {
                val inProgressSignIn = Clerk.signIn ?: return
                viewModelScope.launch {
                    inProgressSignIn
                        .attemptSecondFactor(SignIn.AttemptSecondFactorParams.EmailCode(code))
                        .onSuccess {
                            if (it.status == SignIn.Status.COMPLETE) {
                                _uiState.value = UiState.SignedIn
                            }
                        }
                        .onFailure {
                            // See https://clerk.com/docs/guides/development/custom-flows/error-handling
                            // for more info on error handling
                        }
                }
            }

            sealed interface UiState {
                data object Loading : UiState

                data object SignedOut : UiState

                data object NeedsEmailCode : UiState

                data object SignedIn : UiState
            }
        }
      ```

      ```kotlin {{ filename: 'EmailPasswordSignInActivity.kt', collapsible: true }}
        import android.os.Bundle
        import androidx.activity.ComponentActivity
        import androidx.activity.compose.setContent
        import androidx.activity.viewModels
        import androidx.compose.foundation.layout.*
        import androidx.compose.material3.*
        import androidx.compose.runtime.Composable
        import androidx.compose.runtime.getValue
        import androidx.compose.runtime.mutableStateOf
        import androidx.compose.runtime.remember
        import androidx.compose.runtime.setValue
        import androidx.compose.ui.*
        import androidx.compose.ui.text.input.PasswordVisualTransformation
        import androidx.compose.ui.unit.dp
        import androidx.lifecycle.compose.collectAsStateWithLifecycle
        import com.clerk.api.Clerk

        class EmailPasswordSignInActivity : ComponentActivity() {

            val viewModel: EmailPasswordSignInViewModel by viewModels()

            override fun onCreate(savedInstanceState: Bundle?) {
                super.onCreate(savedInstanceState)
                setContent {
                    val state by viewModel.uiState.collectAsStateWithLifecycle()
                    EmailPasswordSignInView(
                        state = state,
                        onSubmit = viewModel::submit,
                        onVerify = viewModel::verify
                    )
                }
            }
        }

        @Composable
        fun EmailPasswordSignInView(
            state: EmailPasswordSignInViewModel.UiState,
            onSubmit: (String, String) -> Unit,
            onVerify: (String) -> Unit,
        ) {
            var email by remember { mutableStateOf("") }
            var password by remember { mutableStateOf("") }
            var code by remember { mutableStateOf("") }

            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {

                when (state) {

                    EmailPasswordSignInViewModel.UiState.SignedOut -> {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically),
                            horizontalAlignment = Alignment.CenterHorizontally,
                        ) {
                            TextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
                            TextField(
                                value = password,
                                onValueChange = { password = it },
                                visualTransformation = PasswordVisualTransformation(),
                                label = { Text("Password") },
                            )
                            Button(onClick = { onSubmit(email, password) }) { Text("Sign in") }
                        }
                    }

                    EmailPasswordSignInViewModel.UiState.NeedsEmailCode -> {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(16.dp, Alignment.CenterVertically),
                            horizontalAlignment = Alignment.CenterHorizontally,
                        ) {
                            Text("Verify your email")
                            Text("A verification code has been sent to your email.")
                            TextField(
                                value = code,
                                onValueChange = { code = it },
                                label = { Text("Verification code") },
                            )
                            Button(onClick = { onVerify(code) }) { Text("Verify") }
                        }
                    }

                    EmailPasswordSignInViewModel.UiState.SignedIn -> {
                        Text("Current session: ${Clerk.activeSession?.id}")
                    }

                    EmailPasswordSignInViewModel.UiState.Loading ->
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator()
                        }
                }
            }
        }

      ```
    </Tab>
  </Tabs>
</Steps>


------

---
title: Build a custom Google One Tap authentication flow
description: Learn how to build a custom Google One Tap authentication flow
  using the Clerk API.
lastUpdated: 2026-02-06T22:48:01.000Z
sdkScoped: "false"
canonical: /docs/guides/development/custom-flows/authentication/google-one-tap
sourceFile: /docs/guides/development/custom-flows/authentication/google-one-tap.mdx
---

> \[!WARNING]
> This guide is for users who want to build a <Tooltip><TooltipTrigger>custom flow</TooltipTrigger><TooltipContent>A **custom flow** refers to a user interface built entirely from scratch using the Clerk API. Learn more about [custom flows](/docs/guides/development/custom-flows/overview).</TooltipContent></Tooltip>. To use a *prebuilt* UI, use the [Account Portal pages](/docs/guides/account-portal/overview) or <SDKLink href="/docs/:sdk:/reference/components/overview" sdks={["react","nextjs","js-frontend","chrome-extension","expo","expressjs","fastify","react-router","remix","tanstack-react-start","go","astro","nuxt","vue","ruby","js-backend"]}>prebuilt components</SDKLink>.

[Google One Tap](https://developers.google.com/identity/gsi/web/guides/features) enables users to press a single button to authentication in your Clerk application with a Google account.

This guide will walk you through how to build a custom Google One Tap authentication flow.

<Steps>
  ## Enable Google as a social connection

  To use Google One Tap with Clerk, follow the steps in the [dedicated guide](/docs/guides/configure/auth-strategies/social-connections/google#configure-for-your-production-instance) to configure Google as a social connection in the Clerk Dashboard using custom credentials.

  ## Create the Google One Tap authentication flow

  To authenticate users with Google One Tap, you must:

  1. Initialize a ["Sign In With Google"](https://developers.google.com/identity/gsi/web/reference/js-reference) client UI, passing in your Client ID.
  2. Use the response to authenticate the user in your Clerk app if the request was successful.
  3. Redirect the user back to the page they started the authentication flow from by default, or to another URL if necessary.

  The following example creates a component that implements a custom Google One Tap authentication flow, which can be used in a sign-in or sign-up page.

  <Tabs items={["Next.js"]}>
    <Tab>
      ```tsx {{ filename: 'app/components/CustomGoogleOneTap.tsx', collapsible: true }}
      'use client'
      import { useClerk } from '@clerk/nextjs'
      import { useRouter } from 'next/navigation'
      import Script from 'next/script'
      import { useEffect } from 'react'

      // Add clerk to Window to avoid type errors
      declare global {
        interface Window {
          google: any
        }
      }

      export function CustomGoogleOneTap({ children }: { children: React.ReactNode }) {
        const clerk = useClerk()
        const router = useRouter()

        useEffect(() => {
          // Will show the One Tap UI after two seconds
          const timeout = setTimeout(() => oneTap(), 2000)
          return () => {
            clearTimeout(timeout)
          }
        }, [])

        const oneTap = () => {
          const { google } = window
          if (google) {
            google.accounts.id.initialize({
              // Add your Google Client ID here.
              client_id: 'xxx-xxx-xxx',
              callback: async (response: any) => {
                // Here we call our provider with the token provided by Google
                call(response.credential)
              },
            })

            // Uncomment below to show the One Tap UI without
            // logging any notifications.
            // return google.accounts.id.prompt() // without listening to notification

            // Display the One Tap UI, and log any errors that occur.
            return google.accounts.id.prompt((notification: any) => {
              console.log('Notification ::', notification)
              if (notification.isNotDisplayed()) {
                console.log('getNotDisplayedReason ::', notification.getNotDisplayedReason())
              } else if (notification.isSkippedMoment()) {
                console.log('getSkippedReason  ::', notification.getSkippedReason())
              } else if (notification.isDismissedMoment()) {
                console.log('getDismissedReason ::', notification.getDismissedReason())
              }
            })
          }
        }

        const call = async (token: any) => {
          try {
            const res = await clerk.authenticateWithGoogleOneTap({
              token,
            })

            await clerk.handleGoogleOneTapCallback(res, {
              signInFallbackRedirectUrl: '/example-fallback-path',
            })
          } catch (error) {
            router.push('/sign-in')
          }
        }

        return (
          <>
            <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive">
              {children}
            </Script>
          </>
        )
      }
      ```
    </Tab>
  </Tabs>

  You can then display this component on any page. The following example demonstrates a page that displays this component:

  <Tabs items={["Next.js"]}>
    <Tab>
      ```tsx {{ filename: 'app/google-sign-in-example/page.tsx' }}
      import { CustomGoogleOneTap } from '@/app/components/CustomGoogleOneTap'

      export default function CustomOneTapPage({ children }: { children: React.ReactNode }) {
        return (
          <CustomGoogleOneTap>
            <h1>Google One Tap Example</h1>
          </CustomGoogleOneTap>
        )
      }
      ```
    </Tab>
  </Tabs>
</Steps>
