"use client";

import { useEffect, useState } from "react";

interface UserEntry {
  id: string;
  fullName: string;
  email: string;
  role: "patient" | "dentist" | "clinic";
  status: "pending" | "verified" | "rejected";
  documents: string[];
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserEntry[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    }
    fetchUsers();
  }, []);

  async function updateStatus(id: string, status: "verified" | "rejected") {
    await fetch(`/api/admin/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, status } : user))
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Verification Panel</h1>
      {users.length === 0 ? (
        <p>No users to review.</p>
      ) : (
        <div className="space-y-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="border rounded-lg p-4 shadow bg-white dark:bg-gray-800"
            >
              <h2 className="font-semibold">{user.fullName} ({user.role})</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm">Status: {user.status}</p>
              <div className="mt-2 space-y-1">
                {user.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={`/uploads/${doc}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    View document {idx + 1}
                  </a>
                ))}
              </div>
              {user.status === "pending" && (
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => updateStatus(user.id, "verified")}
                    className="bg-green-600 text-white px-4 py-1 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(user.id, "rejected")}
                    className="bg-red-600 text-white px-4 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
