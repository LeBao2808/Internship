"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

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
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8, background: "#e3f2fd", color: "#111" }}>
      <h2 style={{ color: "#111" }}>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: "#111" }}>Email:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", color: "#111" }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ color: "#111" }}>Mật khẩu:</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", color: "#111" }} />
        </div>
        {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
        <button type="submit" style={{ width: "100%", padding: 8, background: "#1976d2", color: "#111", border: "none", borderRadius: 4, fontWeight: 600 }}>Đăng nhập</button>
      </form>
      <button
  onClick={() => signIn("google", { prompt: "select_account" })}
  style={{ width: "100%", padding: 8, background: "#fff", color: "#111", border: "1px solid #1976d2", borderRadius: 4, fontWeight: 600, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
>
  <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 20, height: 20 }} />
  Đăng nhập với Google
</button>
      <div style={{ marginTop: 16, color: "#111" }}>
        Chưa có tài khoản? <a href="/webapp/user-management/register" style={{ color: "#1976d2", textDecoration: "underline" }}>Đăng ký</a>
      </div>
    </div>
  );
}