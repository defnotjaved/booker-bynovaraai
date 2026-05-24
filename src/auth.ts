import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getSnapshot } from "@/lib/store";

declare module "next-auth" {
  interface User {
    role: string;
    barberId?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      barberId?: string;
    } & DefaultSession["user"];
  }
}


// Hashes computed once at server startup for this demo system.
// In production: store hashed passwords in a database.
const DEMO_HASHES: Record<string, string> = {
  "anil@iconbook.local": bcrypt.hashSync("admin123", 10),
  "shivam@iconbook.local": bcrypt.hashSync("barber123", 10),
  "shastri@iconbook.local": bcrypt.hashSync("barber123", 10),
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "");
        const password = String(credentials?.password ?? "");
        const hash = DEMO_HASHES[email];
        if (!hash || !bcrypt.compareSync(password, hash)) return null;

        const { users } = getSnapshot();
        const user = users.find((u) => u.email === email);
        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          barberId: user.barberId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.barberId = user.barberId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      session.user.barberId = token.barberId as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
