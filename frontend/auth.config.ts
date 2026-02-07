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
    async signIn({ profile }) {
      const email = profile?.email as string | undefined;
      if (!email) return false;
      const domain = email.split("@")[1]?.toLowerCase();
      const allowed = (process.env.ALLOWED_DOMAIN || "example.com").toLowerCase();
      return !!(domain === allowed && profile?.email_verified);
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
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