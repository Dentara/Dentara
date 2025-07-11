"use client";

import Link from "next/link";

export default function SignupIndexPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="bg-white shadow p-6 rounded-xl max-w-md w-full space-y-4 text-center">
        <h1 className="text-xl font-bold">Create an Account</h1>

        <div className="flex flex-col gap-4">
          <Link href="/signup/patient" className="bg-blue-600 text-white py-2 rounded">I'm a Patient</Link>
          <Link href="/signup/doctor" className="bg-green-600 text-white py-2 rounded">I'm a Doctor</Link>
          <Link href="/signup/clinic" className="bg-purple-600 text-white py-2 rounded">I'm a Clinic</Link>
        </div>
      </div>
    </div>
  );
}
