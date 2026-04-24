import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment } from '../../types';
import { api } from '../../api';
import { formatTime } from '../../utils/helpers';

export const AdminCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [showCompleteModal, setShowCompleteModal] = useState<Appointment | null>(null);
  const [price, setPrice] = useState('');

  useEffect(() => {
    api.appointments.list().then(setAppointments);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      api.availability.get(selectedDate).then(setSlots);
    }
  }, [selectedDate]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleToggleSlot = async (hour: string) => {
    if (!selectedDate) return;
    const h = parseInt(hour.split(':')[0]);
    const isBooked = appointments.some(a => {
      if (a.date !== selectedDate || a.status !== 'pending') return false;
      const ah = parseInt(a.time.substring(0, 2));
      return h === ah || h === ah + 1;
    });
    if (isBooked) return; // Prevent toggling if already booked

    const newSlots = slots.includes(hour) ? slots.filter(s => s !== hour) : [...slots, hour];
    setSlots(newSlots);
    await api.availability.set({ date: selectedDate, slots: newSlots });
  };

  const handleComplete = async () => {
    if (!showCompleteModal) return;
    const numericPrice = Number(price.replace(/\D/g, ''));
    await api.appointments.complete(showCompleteModal.id, numericPrice);
    setShowCompleteModal(null);
    setPrice('');
    api.appointments.list().then(setAppointments);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-serif italic">
          {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-stone-100 rounded-full">
            <ChevronLeft />
          </button>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-stone-100 rounded-full">
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(d => (
          <div key={d} className="text-center text-xs font-mono text-stone-400 py-2 uppercase">{d}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasAppointments = appointments.some(a => a.date === dateStr && a.status === 'pending');
          return (
            <button
              key={day}
              onClick={() => setSelectedDate(dateStr)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${selectedDate === dateStr ? 'bg-stone-800 text-white' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
            >
              <span className="text-lg font-medium">{day}</span>
              {hasAppointments && <div className="w-1 h-1 bg-emerald-400 rounded-full mt-1" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-stone-50 rounded-3xl border border-stone-200"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-serif">Detalle: {selectedDate}</h4>
              <button onClick={() => setSelectedDate(null)} className="text-stone-400"><X /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h5 className="text-xs font-mono uppercase text-stone-500 mb-4 tracking-widest">Disponibilidad</h5>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 15 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`).map(hour => {
                    const h = parseInt(hour.split(':')[0]);
                    const isBooked = appointments.some(a => {
                      if (a.date !== selectedDate || a.status !== 'pending') return false;
                      const ah = parseInt(a.time.substring(0, 2));
                      return h === ah || h === ah + 1;
                    });
                    return (
                      <button
                        key={hour}
                        onClick={() => handleToggleSlot(hour)}
                        title={isBooked ? "Hora reservada" : "Tocar para cambiar disponibilidad"}
                        className={`p-3 rounded-xl text-sm font-medium transition-all border ${isBooked
                          ? 'bg-rose-100 text-rose-800 border-rose-200 cursor-not-allowed'
                          : slots.includes(hour)
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200'
                            : 'bg-white text-stone-400 border-stone-200 hover:bg-stone-50'
                          }`}
                      >
                        {formatTime(hour)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-mono uppercase text-stone-500 mb-4 tracking-widest">Citas Agendadas</h5>
                <div className="space-y-3">
                  {appointments.filter(a => a.date === selectedDate && a.status === 'pending').map(a => (
                    <div key={a.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-stone-800">{formatTime(a.time)} - {a.user_name || a.casual_name}</p>
                        <p className="text-xs text-stone-500 mb-2">{a.service_name}</p>
                        <div className="flex flex-wrap gap-2 items-center">
                          {(a as any).user_phone && (
                            <a 
                              href={`https://wa.me/57${(a as any).user_phone.replace(/\D/g, '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-medium hover:bg-emerald-100 transition-colors flex items-center gap-1"
                            >
                              WhatsApp
                            </a>
                          )}
                          <a
                            href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Cita: ' + (a.user_name || a.casual_name))}&dates=${a.date.replace(/-/g, '')}T${a.time.replace(/:/g, '')}00/${a.date.replace(/-/g, '')}T${(parseInt(a.time.split(':')[0]) + 2).toString().padStart(2, '0')}${a.time.split(':')[1]}00&details=${encodeURIComponent('Servicio: ' + a.service_name + '\nTeléfono: ' + ((a as any).user_phone || 'No proporcionado'))}&location=${encodeURIComponent('Avenida 35 # 55 - 71 Niquia, Bello')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium hover:bg-blue-100 transition-colors flex items-center gap-1"
                          >
                            Google Calendar
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCompleteModal(a)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full"
                      >
                        <CheckCircle />
                      </button>
                    </div>
                  ))}
                  {appointments.filter(a => a.date === selectedDate && a.status === 'pending').length === 0 && (
                    <p className="text-stone-400 italic text-sm">No hay citas pendientes para este día.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full">
            <h3 className="text-2xl font-serif mb-4">Completar Cita</h3>
            <p className="text-stone-500 mb-6">Ingresa el monto final cobrado a {showCompleteModal.user_name || showCompleteModal.casual_name}.</p>
            <input
              type="text"
              inputMode="numeric"
              value={price}
              onChange={e => {
                const rawValue = e.target.value.replace(/\D/g, '');
                setPrice(rawValue ? Number(rawValue).toLocaleString('es-CO') : '');
              }}
              placeholder="Monto $"
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl mb-6 focus:outline-none"
            />
            <div className="flex gap-4">
              <button onClick={() => setShowCompleteModal(null)} className="flex-1 p-4 text-stone-500">Cancelar</button>
              <button onClick={handleComplete} className="flex-1 p-4 bg-stone-800 text-white rounded-2xl">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
