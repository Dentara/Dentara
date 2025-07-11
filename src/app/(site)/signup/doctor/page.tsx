"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DoctorSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [idFile, setIdFile] = useState<File | null>(null);
  const [diplomaFile, setDiplomaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body = new FormData();
    body.append("fullName", formData.fullName);
    body.append("email", formData.email);
    body.append("password", formData.password);
    body.append("phone", formData.phone);
    if (idFile) body.append("idDocument", idFile);
    if (diplomaFile) body.append("diploma", diplomaFile);

    const res = await fetch("/api/auth/register/doctor", {
      method: "POST",
      body,
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/auth/signin");
    } else {
      setError(data?.error || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Doctor Registration</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          className="w-full border p-2 rounded"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <input
          type="tel"
          placeholder="Phone"
          className="w-full border p-2 rounded"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium mb-1">Upload ID Document</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full border p-2 rounded"
            onChange={(e) => setIdFile(e.target.files?.[0] || null)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Diploma</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full border p-2 rounded"
            onChange={(e) => setDiplomaFile(e.target.files?.[0] || null)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Create Account"}
        </button>

        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
}
