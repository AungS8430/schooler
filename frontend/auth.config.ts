import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { NextResponse } from "next/server";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          hd: process.env.ALLOWED_DOMAIN, // UI hint for Google account selector
        },
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    // Enforce allowed domain and verified email
    async signIn({ account, profile }) {
      const email = profile?.email as string | undefined;
      if (!email) return false;
      const domain = email.split("@")[1]?.toLowerCase();
      const allowed = (process.env.ALLOWED_DOMAIN || "example.com").toLowerCase();
      if (!(!!(domain === allowed && profile?.email_verified)) || !account) {
        return false;
      }
      try {
        const res = await fetch(`${process.env.API_BASE ?? process.env.NEXT_PUBLIC_API_BASE}/auth/oauth/upsert`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // INTERNAL_API_SECRET must NOT be exposed to the browser; this code runs server-side
            "x-internal-secret": process.env.INTERNAL_API_SECRET!,
          },
          body: JSON.stringify({
            provider: account.provider,
            provider_account_id: account.providerAccountId ?? account.id,
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            tokens: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              scope: account.scope,
            },
          }),
        });

        if (res.status === 409) {
          // OAuth account is already linked to a different user.
          // Return false to deny sign-in (NextAuth will redirect to signIn page with an error).
          return false;
          // Alternatively you can return a URL (string) to redirect to a custom "link-error" page:
          // return "/link-error";
        }

        if (!res.ok) {
          // Upsert failed for other reasons; deny sign-in
          return false;
        }

        // Success: allow sign-in
        return true;
      } catch (err) {
        console.error("upsert failed", err);
        return false;
      }
    },
    async jwt({ token, user, account, profile }) {
      if (account && profile) {
        try {
          const res = await fetch(`${process.env.API_BASE}/internal/oauth/upsert`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-secret": process.env.INTERNAL_API_SECRET!,
            },
            body: JSON.stringify({
              provider: account.provider,
              provider_account_id: account.providerAccountId ?? account.id,
              email: profile.email,
              name: profile.name,
              image: profile.picture,
              tokens: {
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                scope: account.scope,
              },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            token.sub = String(data.id);
          } else {
            console.error("upsert failed:", res.status);
          }
        } catch (err) {
          console.error("upsert request failed:", err);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      } else if (token.id) {
        session.user.id = String(token.id);
      }
      return session;
    },
    authorized({ auth, request: { nextUrl }}) {
      const isLoggedIn = !!auth;
      const isOnLoginPage = !nextUrl.pathname.startsWith("/app");
      const isAuthRoute = nextUrl.pathname.startsWith("/api/auth");

      if (isAuthRoute) {
        return true;
      }

      if (isOnLoginPage && isLoggedIn) {
        return NextResponse.redirect(new URL("/app", nextUrl));
      }

      return !(!isLoggedIn && !isOnLoginPage);
    }
  },
} satisfies NextAuthConfig