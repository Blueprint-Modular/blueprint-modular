import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  trustHost: true,
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};

export type Role = "OWNER" | "ADMIN" | "USER";

export function requireRole(role: Role): Role[] {
  const order: Role[] = ["USER", "ADMIN", "OWNER"];
  const i = order.indexOf(role);
  return order.slice(i);
}

export function canEdit(_user: { role?: string }, _resource: unknown): boolean {
  return true;
}

export function canContributeToWiki(user: { role?: string }): boolean {
  const r = user.role ?? "USER";
  return r === "OWNER" || r === "ADMIN";
}
