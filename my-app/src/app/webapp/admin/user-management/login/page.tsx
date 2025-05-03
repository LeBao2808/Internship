"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        router.push("/webapp/admin/user-management");
      } else {
        const data = await res.json();
        setError(data.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Mật khẩu:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%" }} />
        </div>
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", padding: 8 }}>Đăng nhập</button>
      </form>
      <div style={{ marginTop: 16 }}>
        Chưa có tài khoản? <a href="/webapp/user-management/register">Đăng ký</a>
      </div>
    </div>
  );
}