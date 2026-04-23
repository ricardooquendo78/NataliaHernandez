import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment } from '../../types';
import { api } from '../../api';
import { formatTime } from '../../utils/helpers';

export const AdminHistory = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    api.appointments.list().then(setAppointments);
  }, []);

  const filtered = appointments.filter(a => {
    const d = new Date(a.date);
    return a.status === 'completed' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthName = new Date(currentYear, currentMonth).toLocaleString('es-ES', { month: 'long' });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-serif italic">Historial: {monthName} {currentYear}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="p-2 hover:bg-stone-100 rounded-full"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="p-2 hover:bg-stone-100 rounded-full"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && <p className="text-stone-400 italic">No hay citas completadas en este periodo.</p>}
        {filtered.slice().reverse().map(a => (
          <div key={a.id} className="bg-stone-50 p-6 rounded-3xl border border-stone-100 flex justify-between items-center">
            <div>
              <p className="font-bold text-stone-800">{a.date} - {formatTime(a.time)}</p>
              <p className="text-sm text-stone-600">{a.user_name || a.casual_name} - {a.service_name}</p>
            </div>
            <div className="text-right">
              <p className="text-emerald-600 font-bold text-xl">${a.price_charged?.toLocaleString()}</p>
              <p className="text-xs text-stone-400 uppercase font-mono">Cobrado</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
