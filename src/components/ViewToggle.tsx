import React from 'react';

interface ViewToggleProps {
  viewMode: 'day' | 'week' | 'month';
  onChange: (mode: 'day' | 'week' | 'month') => void;
  selectedDoctorId: string;
  doctors: { id: string; fullName: string }[];
  onDoctorChange: (doctorId: string) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onChange, selectedDoctorId, doctors, onDoctorChange }) => (
  <div className="flex gap-2">
    {['day', 'week', 'month'].map((mode) => (
      <button
        key={mode}
        onClick={() => onChange(mode as any)}
        className={`px-3 py-1 rounded text-sm border ${viewMode === mode ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
      >
        {mode.toUpperCase()}
      </button>
    ))}
    <select
      value={selectedDoctorId}
      onChange={(e) => onDoctorChange(e.target.value)}
      className="border p-1 rounded text-sm"
    >
      <option value="">All Doctors</option>
      {doctors.map((d) => (
        <option key={d.id} value={d.id}>{d.fullName}</option>
      ))}
    </select>
  </div>
);