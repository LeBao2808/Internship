
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
    // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    // const hasSessionToken = req.cookies.has('next-auth.session-token') || req.cookies.has('accessToken') || req.cookies.has('refreshToken')
    // if (!hasSessionToken) {
    //   return NextResponse.redirect(new URL('/authen/login', req.url))
    // }

    console.log("req" ,req)
    const secret = process.env.NEXTAUTH_SECRET;
    console.log(process.env.NODE_ENV);
    // const token = await getToken({ req, secret });
    // const token = req.cookies.get('next-auth.session-token')?.value || ""
    const token = await getToken({
                req: req,
                secret: process.env.NEXTAUTH_SECRET,
                cookieName:
                    process.env.NODE_ENV === 'production'
                        ? '__Secure-next-auth.session-token'
                        : 'next-auth.session-token',
            });

    console.log("URL:", req.nextUrl.pathname);
  console.log("Cookies:", req.cookies.getAll());
  console.log("Token:", token);
    const isLoginPage = req.nextUrl.pathname.startsWith("/authen/login");
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  
 
    if (isLoginPage && token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  
       console.log("token", token );
    if (isAdminRoute) {
  
      if (!token) {
        return NextResponse.redirect(new URL("/authen/login", req.url));
      }
       console.log("token", token )

      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/UI/blog", req.url));
      }
    } 
  

    return NextResponse.next()
  }
   
  export const config = {
    matcher: ['/', '/admin/:path*'],
  }