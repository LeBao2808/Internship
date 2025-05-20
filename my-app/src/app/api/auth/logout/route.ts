import { NextResponse } from "next/server";

export async function POST() {
  // Danh sách tên cookie cần xóa (bạn có thể mở rộng nếu cần)
  const cookiesToDelete = ["accessToken", "refreshToken", "next-auth.session-token"];

  const response = NextResponse.json({ message: "Đã xóa cookies" });

  cookiesToDelete.forEach((cookieName) => {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0), // Hết hạn ngay lập tức
    });
  });

  return response;
}