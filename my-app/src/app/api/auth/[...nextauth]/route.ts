import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


// Define authentication options
export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          });
        
          if (!res.ok) return null;
        
          const data = await res.json();
        
          if (data?.user) {
            const user = data.user;
        
            const userId = user.userId;
        
            if (!userId) {
              console.error("❌ User không có userId", user);
              return null;
            }
        
            return {
              id: userId, // ✅ Gán userId vào id ở đây
              email: user.email,
              name: user.name,
              image: user.image_url || "/default.png",
              role: user.role,
            };
          }
        
          return null;
        },
      }),
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const { email, name, image } = user;

        if (!email) return false;

        try {
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/check-email`, {
            method: "POST",
            body: JSON.stringify({ email }),
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          if (!data.exists && name) {
            const registerRes = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/register`, {
              method: "POST",
              body: JSON.stringify({
                name,
                email,
                password: null, 
                image,
              }),
              headers: { "Content-Type": "application/json" },
            });

            if (!registerRes.ok) {
              console.error("Register failed");
              return false;
            }
          }

          return true; // Cho phép đăng nhập
        } catch (error) {
          console.error("Error during Google sign-in:", error);
          return false;
        }
      }

      return true; // Cho phép các provider khác
    },


    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; 
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        image: token.image as string | null | undefined, 
        role: token.role as string,
      } ;
      return session;
    },
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
