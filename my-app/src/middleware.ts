
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
    // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const hasSessionToken = req.cookies.has('next-auth.session-token') || req.cookies.has('accessToken') || req.cookies.has('refreshToken')
    if (!hasSessionToken) {
      return NextResponse.redirect(new URL('/authen/login', req.url))
    }
    return NextResponse.next()
  }
   
  export const config = {
    matcher: ['/', '/admin/:path*'],
  }