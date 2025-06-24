import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const objRq = {
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "next-auth.session-token",
  };
  const token = await getToken(objRq);
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  console.log(isLoginPage, token, process.env.NEXTAUTH_SECRET);

  if (isLoginPage && token) {

    return NextResponse.redirect(new URL("/", req.url));
  }
  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // if (token.role !== "admin") {
    //   return NextResponse.redirect(new URL("/UI/blog", req.url));
    // }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
