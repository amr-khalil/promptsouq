declare global {
  interface ClerkAuthorization {
    role: "admin" | "user";
  }
}

declare module "@clerk/types" {
  interface PublicMetadata {
    role?: "admin" | "user";
  }
}

export {};
