export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  role: "admin" | "user";
  onboardingCompleted: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastSignInAt: string;
}
