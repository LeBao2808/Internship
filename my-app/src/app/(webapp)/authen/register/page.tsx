"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const image = "https://res.cloudinary.com/dso3i79wd/image/upload/v1750145670/users/file.png";
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password,image }),
      });
      if (res.ok) {
        alert("Registration successful! Redirecting...")
        setTimeout(() => router.push("/authen/login"), 100);
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch (_) {
      setError("Server connection error");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 w-full">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="">
            <label className="block text-blue-700 font-semibold mb-1">
              Name:
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-blue-700 font-semibold mb-1">
              Password:
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-900"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {error && (
            <div style={{ color: "red", marginBottom: 12 }}>{error}</div>
          )}
          <button
            type="submit"
            className="w-full py-2 mt-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow transition cursor-pointer"
          >
            Sign Up
          </button>
          <div style={{ marginTop: 16 }}>
            Already have an account?{" "}
            <a
              href="/authen/login"
              className="text-blue-700 underline hover:text-blue-900"
            >
              Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
