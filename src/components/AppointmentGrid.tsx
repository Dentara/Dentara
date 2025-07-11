import React from 'react';
import clsx from 'clsx';

interface Appointment {
  id: string;
  date: string;
  reason?: string;
  status: string;
  doctor: { id: string; fullName: string };
  patient: { id: string; fullName: string };
}

interface GridProps {
  workingHours: string[];
  days: string[];
  appointments: Appointment[];
  selectedDoctorId: string;
  isDragging: boolean;
  selectedRange: { day: string; start: string; end: string } | null;
  onRangeSelect: (range: { day: string; start: string; end: string }) => void;
  onSlotClick: (day: string, time: string) => void;
}

export const AppointmentGrid: React.FC<GridProps> = ({ workingHours, days, appointments, selectedDoctorId, isDragging, selectedRange, onRangeSelect, onSlotClick }) => {
  const statusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-200';
      case 'completed': return 'bg-green-200';
      case 'cancelled': return 'bg-red-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="overflow-x-auto border rounded-lg">
      <div className="min-w-[1000px] grid grid-cols-[100px_repeat(auto-fill,minmax(200px,1fr))] border-b border-gray-400">
        <div className="bg-gray-100 font-semibold p-2 text-center border-r border-gray-400">Time</div>
        {days.map((day) => (
          <div key={day} className="bg-gray-100 font-semibold p-2 text-center border-r border-gray-400">{day}</div>
        ))}
      </div>

      {workingHours.map((time) => (
        <div key={time} className="min-w-[1000px] grid grid-cols-[100px_repeat(auto-fill,minmax(200px,1fr))] border-b border-gray-300">
          <div className="bg-gray-50 p-2 text-sm text-center border-r border-gray-400">{time}</div>
          {days.map((day) => {
            const appt = appointments.find(
              (a) =>
                (selectedDoctorId === '' || a.doctor.id === selectedDoctorId) &&
                new Date(a.date).toLocaleDateString() === day &&
                new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === time
            );

            return (
              <div
                key={day + time}
                className="p-2 border-r border-gray-400 h-[80px] relative"
                onClick={() => !appt && onSlotClick(day, time)}
                onMouseDown={() => appt || onRangeSelect({ day, start: time, end: time })}
                onMouseEnter={() => isDragging && selectedRange?.day === day && onRangeSelect({ day, start: selectedRange.start, end: time })}
                onMouseUp={() => isDragging && selectedRange && onSlotClick(day, selectedRange.start)}
              >
                {appt ? (
                  <div className={`h-full w-full rounded-md shadow text-xs px-2 py-1 ${statusColor(appt.status)}`}>
                    <p className="font-semibold truncate">{appt.patient.fullName}</p>
                    <p className="text-gray-700">{appt.reason}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{appt.status}</p>
                  </div>
                ) : (
                  <div className={clsx(
                    'text-gray-300 text-xs text-center pt-6 cursor-pointer hover:bg-blue-50 rounded',
                    isDragging && selectedRange?.day === day &&
                      time >= selectedRange.start && time <= selectedRange.end ? 'bg-blue-200' : ''
                  )}>
                    +
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};