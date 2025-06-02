import { NextResponse } from "next/server";

export async function POST() {
  // List of cookies to delete
  const cookiesToDelete = ["accessToken", "refreshToken", "next-auth.session-token"];

  const response = NextResponse.json({ message: "Cookies deleted" });

  cookiesToDelete.forEach((cookieName) => {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0), // Expires immediately
    });
  });

  return response;
}