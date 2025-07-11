'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function PatientSigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await signIn("credentials", {
      email,
      password,
      accountType: "patient",
      callbackUrl: "/redirect",
      redirect: true,
    });
  };

  return (
    <div>
      <h2>Patient Login</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Sign In</button>
    </div>
  );
}
