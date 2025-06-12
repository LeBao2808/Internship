import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authOptions } from "@/resources/lib/auth.config";







// Correctly export GET and POST handlers for the App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
