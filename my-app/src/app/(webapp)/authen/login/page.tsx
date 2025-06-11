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

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.ok) {
      // Lấy lại session để redirect theo role
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const role = session?.user?.role;

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/UI/blog");
      }
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 w-full px-3">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center ">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Sign In</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div>
            <label className="block text-blue-700 font-semibold mb-1">
              Email:
            </label>
            <input
              type="email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50 text-gray-900"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 mt-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold shadow transition"
          >
            Login
          </button>
        </form>
        <button
          onClick={() =>
            signIn("google", { callbackUrl: "/admin/user-management" })
          }
          className="w-full py-2 mt-4 bg-white border border-blue-700 text-blue-900 rounded-lg font-semibold flex items-center justify-center gap-2 shadow hover:bg-blue-50 transition"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5"
          />
          Sign in Google
        </button>
        <div className="mt-6 text-blue-900">
          Dont have an account?{" "}
          <a
            href="/authen/register"
            className="text-blue-700 underline hover:text-blue-900"
          >
            Sign up now.
          </a>
        </div>
      </div>
    </div>
  );
}
