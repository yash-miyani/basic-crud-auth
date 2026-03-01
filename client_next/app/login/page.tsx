"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "@/services/api";

export default function Login() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    api: "",
  });

  // Email format regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    let valid = true;
    const newErrors = { email: "", password: "", api: "" };

    if (!form.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Enter valid email";
      valid = false;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      router.push("/products");
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        api: error?.response?.data?.message || "Login failed",
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="bg-card border border-border p-6 shadow-md rounded-lg w-80 text-text">
        <h2 className="text-xl font-bold mb-5 text-center">Login</h2>

        {/* Email */}
        <input
          className="border border-border bg-transparent p-2 w-full mb-1 rounded outline-none focus:ring-2 focus:ring-primary"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {errors.email && (
          <p className="text-danger text-sm mb-2">{errors.email}</p>
        )}

        {/* Password */}
        <div className="mt-2">
          <input
            type="password"
            className="border border-border bg-transparent p-2 w-full mb-1 rounded outline-none focus:ring-2 focus:ring-primary"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && (
            <p className="text-danger text-sm mb-2">{errors.password}</p>
          )}
        </div>

        {/* API Error */}
        {errors.api && (
          <p className="text-danger text-sm mb-3 text-center">{errors.api}</p>
        )}

        <button
          onClick={handleLogin}
          className="bg-primary hover:bg-primary-hover cursor-pointer w-full p-2 rounded transition text-white disabled:bg-primary/50 disabled:cursor-not-allowed mt-2"
          disabled={!form.email || !form.password}
        >
          Login
        </button>

        <p className="text-sm mt-4 text-center">
          <Link href="/register" className="text-primary hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
