"use client";

import { useState } from "react";
import PatientForm from "./PatientForm";
import DentistForm from "./DentistForm";
import ClinicForm from "./ClinicForm";

export default function SignUpSwitcher() {
  const [role, setRole] = useState("patient");

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-full border ${role === "patient" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          onClick={() => setRole("patient")}
        >
          👤 Pasiyent
        </button>
        <button
          className={`px-4 py-2 rounded-full border ${role === "dentist" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          onClick={() => setRole("dentist")}
        >
          🦷 Həkim
        </button>
        <button
          className={`px-4 py-2 rounded-full border ${role === "clinic" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          onClick={() => setRole("clinic")}
        >
          🏥 Klinika
        </button>
      </div>

      {role === "patient" && <PatientForm />}
      {role === "dentist" && <DentistForm />}
      {role === "clinic" && <ClinicForm />}
    </div>
  );
}
