'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function ClinicSigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const res = await signIn("credentials", {
      email,
      password,
      accountType: "clinic", 
      callbackUrl: "/redirect",
      redirect: false, 
    });

    if (res?.ok) {
      window.location.href = res.url ?? "/redirect";
    } else {
      setError("Login failed. Please check your credentials or role.");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Clinic Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px", padding: "8px" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "10px", padding: "8px" }}
      />

      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Sign In as Clinic
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}
