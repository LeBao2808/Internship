
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
    // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    // const hasSessionToken = req.cookies.has('next-auth.session-token') || req.cookies.has('accessToken') || req.cookies.has('refreshToken')
    // if (!hasSessionToken) {
    //   return NextResponse.redirect(new URL('/authen/login', req.url))
    // }
    // const token = await getToken({ req, secret });
    console.log("req", req);
    
    const tokenRq = req.cookies.get('next-auth.session-token')?.value || ""
    console.log("tokenRq",tokenRq);
    
    const reqProduction:any = req.cookies.set("__Secure-next-auth.session-token", tokenRq)
    const objRq = {
                req: process.env.NODE_ENV === "production" ? reqProduction : req,
                secret: process.env.NEXTAUTH_SECRET,
                cookieName:
                    process.env.NODE_ENV === 'production'
                        ? '__Secure-next-auth.session-token'
                        : 'next-auth.session-token',
            }
    console.log("reqProduction",reqProduction);
    console.log("objRq", objRq);
    const token = await getToken(objRq);
    const isLoginPage = req.nextUrl.pathname.startsWith("/authen/login");
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    console.log(isLoginPage, token);
            
    if (isLoginPage && token) {
      console.log("Vô");
      
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (isAdminRoute) {
      if (!token) {
        console.log("out 1");
        
        return NextResponse.redirect(new URL("/authen/login", req.url));
      }
      if (token.role !== "admin") {
          console.log("out 2");
        return NextResponse.redirect(new URL("/UI/blog", req.url));
      }
    } 
  
    console.log("callback");
    
    return NextResponse.next()
  }
   
  export const config = {
    matcher: ['/', '/admin/:path*'],
  }