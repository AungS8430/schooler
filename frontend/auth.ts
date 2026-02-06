import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
    signIn: "/login",
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
  },
});
