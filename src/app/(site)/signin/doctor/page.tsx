'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function DoctorSigninPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    await signIn("credentials", {
      email,
      password,
      accountType: "doctor",
      callbackUrl: "/redirect",
      redirect: true,
    });
  };

  return (
    <div>
      <h2>Doctor Login</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Sign In</button>
    </div>
  );
}
