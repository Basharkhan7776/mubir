import { createAuthClient } from "better-auth/react";

const getServerUrl = () => {
  // Use VITE_ env for web (vite exposes VITE_*)
  // For localhost dev: set VITE_SERVER_URL=http://localhost:3001
  return (
    import.meta.env.VITE_SERVER_URL ||
    "http://localhost:3001"
  );
};

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const authClient = createAuthClient({
  baseURL: getServerUrl(),
  // For Google OAuth on web, the client ID is mainly used server-side,
  // but you can use GOOGLE_CLIENT_ID here for client-side Google Sign-In if you switch flows.
});

// Convenience exports (match patterns used elsewhere)
// Uses better-auth client which will redirect the browser to the server's
// auth handler (the app.all(/^\/api\/auth/, ...) route), perform Google OAuth,
// then the server will redirect back to the provided callbackURL.
export const signInWithGoogle = (callbackURL?: string) => {
  const cb = callbackURL || "/app";
  // Always use absolute URL for callback so the server (different origin/port)
  // redirects the browser back to the *web* app's /app .
  const fullCallback = cb.startsWith("http")
    ? cb
    : `${window.location.origin}${cb.startsWith("/") ? "" : "/"}${cb}`;

  return authClient.signIn.social({
    provider: "google",
    callbackURL: fullCallback,
  });
};

export const signOut = () => authClient.signOut({ fetchOptions: { redirect: "manual" } });

export const getSession = () => authClient.getSession();

export const useSession = authClient.useSession;
