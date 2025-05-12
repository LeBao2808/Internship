import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

// Define authentication options
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Luôn chuyển hướng về trang user-management sau khi đăng nhập thành công
      return "/admin/user-management";
    },
  },
  // You can add more options like pages, callbacks, etc. here
};

// Correctly export GET and POST handlers for the App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
