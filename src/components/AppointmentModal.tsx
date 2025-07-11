import React from 'react';

interface AppointmentModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: { doctorId: string; patientId: string; date: string; reason: string };
  setForm: React.Dispatch<React.SetStateAction<{ doctorId: string; patientId: string; date: string; reason: string }>>;
  doctors: { id: string; fullName: string }[];
  patients: { id: string; fullName: string }[];
  duration: number;
  loading: boolean;
  message: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({ show, onClose, onSubmit, form, setForm, doctors, patients, duration, loading, message }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-2">New Appointment</h3>
        <form onSubmit={onSubmit} className="space-y-3">
          <select
            name="doctorId"
            value={form.doctorId}
            onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.fullName}</option>
            ))}
          </select>

          <select
            name="patientId"
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName}</option>
            ))}
          </select>

          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border p-2 rounded"
            required
          />

          <select
            name="duration"
            value={duration}
            onChange={(e) => setForm((prev) => ({ ...prev, /* duration managed externally */ }))}
            className="w-full border p-2 rounded"
            disabled
          >
            <option value={duration}>{duration} minutes</option>
          </select>

          <input
            type="text"
            name="reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Reason"
            className="w-full border p-2 rounded"
          />

          {message && <p className="text-red-500 text-sm truncate">{message}</p>}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
