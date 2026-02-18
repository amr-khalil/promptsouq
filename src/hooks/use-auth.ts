"use client";

import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/types/auth";
import { useCallback, useEffect, useRef, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const supabaseRef = useRef(createClient());

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const supabase = supabaseRef.current;

    // Check initial session
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        fetchProfile().then(() => setIsLoaded(true));
      } else {
        setIsLoaded(true);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        fetchProfile();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    const supabase = supabaseRef.current;
    await supabase.auth.signOut();
    await fetch("/api/auth/sign-out", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  }, []);

  return {
    user,
    isLoaded,
    isSignedIn: !!user,
    signOut,
  };
}
