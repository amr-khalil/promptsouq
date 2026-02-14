import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Check if the current user has admin role via Clerk publicMetadata.
 * Returns { isAdmin: true, userId } or { isAdmin: false, userId }.
 */
export async function checkAdmin() {
  const { userId } = await auth();

  if (!userId) {
    return { isAdmin: false, userId: null } as const;
  }

  const user = await currentUser();
  const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
  return { isAdmin: role === "admin", userId } as const;
}

/**
 * Check if the current user is authenticated.
 * Returns userId or null.
 */
export async function checkAuth() {
  const { userId } = await auth();
  return userId;
}
