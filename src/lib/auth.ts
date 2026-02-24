import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import { getServerSession as getNextAuthServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ 
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true,
          }
        });
        
        if (!user || !user.passwordHash) {
          return null;
        }
        
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        
        if (!isValid) {
          return null;
        }
        
        return { 
          id: user.id, 
          email: user.email, 
          name: user.name,
          role: user.role
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = user?.id ?? token.id;
        session.user.role = user?.role ?? token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/auth/signout",
    verifyRequest: "/login/verify",
    error: "/login/error",
  },
  session: {
    strategy: "jwt",
  },
};

export async function getServerSession() {
  return await getNextAuthServerSession(authOptions);
}

export function isStaffOrAdmin(session: { user?: { role?: Role } } | null): boolean {
  return session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";
}
