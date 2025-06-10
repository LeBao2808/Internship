import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
const ADMIN_EMAIL = "ble07983@gmail.com";
// Define authentication options
const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account", // select_account is the default behavior
        },
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
     //this is the default behavior
     // Allows relative callback URLs
     if (url.startsWith("/")) return `${baseUrl}${url}`
     // Allows callback URLs on the same origin
     else if (new URL(url).origin === baseUrl) return url
    //  return baseUrl
    return "/admin";
   }
 },

 cookies: {
  sessionToken: {
    name: `next-auth.session-token`, // không có __Secure-
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false, // ⚠️ rất quan trọng khi dev local
    },
  },
},
  // You can add more options like pages, callbacks, etc. here

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    verifyRequest: '/auth/verify-request', // (used for check email message)
    newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  }

};




// Correctly export GET and POST handlers for the App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
