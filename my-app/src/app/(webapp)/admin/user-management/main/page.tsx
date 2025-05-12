"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";


export default function MainPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    // Kiểm tra trạng thái đăng nhập (ví dụ: kiểm tra token/session ở localStorage)
    // Nếu chưa đăng nhập thì chuyển hướng về trang đăng nhập
    // Ở đây chỉ là ví dụ đơn giản, thực tế nên kiểm tra token hợp lệ
    const isLoggedIn = true; // Thay bằng logic thực tế
    if (!isLoggedIn) {
      router.push("/user-management/login");
    }
    setTimeout(() => setLoading(false), 600); // Giả lập hiệu ứng loading
  }, [router]);

  const handleLogout = () => {
    setLoading(true);
    // Xoá token/session ở đây nếu có
    setTimeout(() => {
      router.push("/user-management/login");
    }, 600);
  };


  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Chào mừng bạn đến trang chính!</h2>
      <p>Bạn đã đăng nhập thành công.</p>
      <button onClick={handleLogout} style={{ marginTop: 24, padding: 8 }}>Đăng xuất</button>
    </div>
  );
}