import type { NextAuthOptions } from "next-auth";

// Minimal, edge-safe config for middleware. No providers/adapters here.
const authConfig: Partial<NextAuthOptions> = {
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login/error",
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        // Pass through custom fields if present on the token
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export default authConfig;


