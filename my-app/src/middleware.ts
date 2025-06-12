
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
    // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    // const hasSessionToken = req.cookies.has('next-auth.session-token') || req.cookies.has('accessToken') || req.cookies.has('refreshToken')
    // if (!hasSessionToken) {
    //   return NextResponse.redirect(new URL('/authen/login', req.url))
    // }
    const secret = process.env.NEXTAUTH_SECRET;
    const token = await getToken({ req, secret });
  
    const isLoginPage = req.nextUrl.pathname.startsWith("/authen/login");
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  
 
    if (isLoginPage && token) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  

    if (isAdminRoute) {
  
      if (!token) {
        return NextResponse.redirect(new URL("/authen/login", req.url));
      }
  

      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/UI/blog", req.url));
      }
    }
  

    return NextResponse.next()
  }
   
  export const config = {
    matcher: ['/', '/admin/:path*'],
  }