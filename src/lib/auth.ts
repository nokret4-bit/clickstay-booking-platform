import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import { getServerSession as getNextAuthServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { normalizePermissions } from "@/lib/permissions";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: Role;
      permissions: Record<string, boolean>;
      isActive: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    permissions?: Record<string, boolean>;
    isActive?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    permissions?: Record<string, boolean>;
    isActive?: boolean;
    iat?: number; // Token issued at timestamp
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
            permissions: true,
            isActive: true,
            passwordHash: true,
          }
        });
        
        if (!user || !user.passwordHash) {
          return null;
        }
        if (!user.isActive) {
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
          role: user.role,
          permissions: normalizePermissions(user.permissions),
          isActive: user.isActive,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        // Use token values which are more reliable in JWT strategy
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.permissions = (token.permissions as Record<string, boolean>) || {};
        session.user.isActive = (token.isActive as boolean) ?? true;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // Ensure permissions are properly stored
        token.permissions = user.permissions ?? {};
        token.isActive = user.isActive ?? true;
        token.iat = Math.floor(Date.now() / 1000); // Track token issued time
      }
      // Check if token has been issued and is older than 8 hours
      if (token.iat) {
        const now = Math.floor(Date.now() / 1000);
        const tokenAge = now - (token.iat as number);
        const maxAge = 8 * 60 * 60; // 8 hours in seconds
        
        if (tokenAge > maxAge) {
          // Token has expired, return null to invalidate
          return null as any;
        }
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
    maxAge: 8 * 60 * 60, // 8 hours in seconds
  },
};

export async function getServerSession() {
  return await getNextAuthServerSession(authOptions);
}

export function isStaffOrAdmin(session: { user?: { role?: Role } } | null): boolean {
  return session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";
}
