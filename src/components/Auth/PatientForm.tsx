"use client";

import { useState } from "react";
import TermsModal from "./TermsModal";
import { uploadFormData } from "../../lib/uploadFormData";

export default function PatientForm() {
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("role", "patient");

    try {
      await uploadFormData("/api/register", formData);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold">Patient Registration</h2>

      <input name="fullName" className="w-full border p-2 rounded" type="text" placeholder="Full Name" required />
      <input name="email" className="w-full border p-2 rounded" type="email" placeholder="Email" required />
      <input name="phone" className="w-full border p-2 rounded" type="tel" placeholder="Phone Number" required />
      <input name="password" className="w-full border p-2 rounded" type="password" placeholder="Password" required />
      <input name="confirmPassword" className="w-full border p-2 rounded" type="password" placeholder="Repeat Password" required />

      <div className="flex items-center space-x-2">
        <input id="agree" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <label htmlFor="agree" className="text-sm">
          <button type="button" className="underline" onClick={() => setShowTerms(true)}>
            I agree to the Terms & Conditions
          </button>
        </label>
      </div>

      <button
        type="submit"
        disabled={!agreed || loading}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "Registering..." : "Register"}
      </button>

      {success && <p className="text-green-600">Registration successful!</p>}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </form>
  );
}