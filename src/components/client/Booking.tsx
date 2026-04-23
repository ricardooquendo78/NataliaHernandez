import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Service, Appointment } from '../../types';
import { api } from '../../api';
import { formatTime } from '../../utils/helpers';

interface BookingProps {
  user: User | null;
}

export const Booking = ({ user }: BookingProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([]);
  const [success, setSuccess] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState<Appointment | null>(null);
  const [loadingPending, setLoadingPending] = useState(!!user);

  if (user?.role === 'admin') {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-3xl font-serif italic mb-4">Acceso Restringido</h2>
        <p className="text-stone-500">Como administradora, puedes gestionar las citas desde el panel de Admin.</p>
        <button onClick={() => window.location.href = '/'} className="mt-8 bg-stone-800 text-white px-8 py-3 rounded-xl">Volver al Inicio</button>
      </div>
    );
  }

  useEffect(() => {
    api.services.list().then(setServices);
    if (user) {
      api.appointments.list().then(apps => {
        const pending = apps.find(a => a.user_id === user.id && a.status === 'pending');
        setPendingAppointment(pending || null);
        setLoadingPending(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      api.availability.get(selectedDate).then(setAvailableSlots);
      api.appointments.list().then(apps => {
        const booked = apps.filter(a => a.date === selectedDate && a.status === 'pending');
        setBookedAppointments(booked);
      });
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.appointments.create({
      user_id: user?.id,
      casual_name: user ? null : name,
      casual_phone: user ? null : phone,
      service_id: serviceId,
      date: selectedDate,
      time: selectedTime
    });
    setSuccess(true);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-serif italic mb-2">¡Cita Agendada!</h2>
        <p className="text-stone-500">Te esperamos el día {selectedDate} a las {formatTime(selectedTime)}.</p>
        <button onClick={() => window.location.reload()} className="mt-8 bg-gradient-to-r from-rose-800 to-rose-950 text-white px-8 py-3 rounded-xl shadow-lg">Volver</button>
      </div>
    );
  }

  if (loadingPending) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (pendingAppointment) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-800 rounded-full flex items-center justify-center mb-6 mx-auto">
          <Calendar size={40} />
        </div>
        <h2 className="text-3xl font-serif italic mb-4">Ya tienes una cita</h2>
        <div className="bg-white p-6 rounded-[2rem] border border-rose-100 shadow-sm mb-8">
          <p className="text-stone-500 text-sm uppercase font-mono tracking-widest mb-2">Tu próxima sesión</p>
          <p className="text-2xl font-serif text-rose-950">{pendingAppointment.date}</p>
          <p className="text-lg text-rose-800">{formatTime(pendingAppointment.time)}</p>
          <div className="mt-4 pt-4 border-t border-rose-50">
            <p className="text-xs text-stone-400">Si necesitas reprogramar, por favor contáctanos por WhatsApp.</p>
          </div>
        </div>
        <button onClick={() => window.location.href = '#contact'} className="text-rose-800 font-medium underline">Contáctanos</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="text-center">
        <h2 className="text-4xl font-serif italic mb-2">Agendar Cita</h2>
        <p className="text-stone-500">Selecciona el día y hora que mejor te convenga.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h3>
            <div className="flex gap-2">
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-stone-100 rounded-full"><ChevronLeft /></button>
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-stone-100 rounded-full"><ChevronRight /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d, i) => <div key={`${d}-${i}`} className="text-center text-xs font-mono text-stone-400 py-2">{d}</div>)}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isPast = new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
              return (
                <button
                  key={day}
                  disabled={isPast}
                  onClick={() => { setSelectedDate(dateStr); setSelectedTime(null); }}
                  className={`aspect-square rounded-xl flex items-center justify-center transition-all ${selectedDate === dateStr ? 'bg-stone-800 text-white shadow-lg' : isPast ? 'text-stone-200 cursor-not-allowed' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedDate ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-mono uppercase text-stone-500 mb-4 tracking-widest">Horarios Disponibles</label>
                <div className="grid grid-cols-4 gap-3">
                  {availableSlots.sort().map(hour => {
                    const h = parseInt(hour.split(':')[0]);
                    const isBooked = bookedAppointments.some(a => {
                      const ah = parseInt(a.time.substring(0, 2));
                      // Blocked if the interval [h, h+2) overlaps with [ah, ah+2)
                      return h === ah || h === ah + 1 || h + 1 === ah;
                    });
                    return (
                      <button
                        key={hour}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTime(hour)}
                        className={`p-3 rounded-xl text-sm font-medium border transition-all ${selectedTime === hour ? 'bg-stone-800 text-white border-stone-800' : isBooked ? 'bg-stone-100 text-stone-300 border-stone-100 cursor-not-allowed' : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                          }`}
                      >
                        {formatTime(hour)}
                      </button>
                    );
                  })}
                  {availableSlots.length === 0 && <p className="col-span-3 text-stone-400 italic text-sm">No hay horarios disponibles para este día.</p>}
                </div>
              </div>

              <div className="space-y-4">
                <select
                  value={serviceId}
                  onChange={e => setServiceId(e.target.value)}
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none"
                  required
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none"
                  required
                  disabled={!!user}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Tu teléfono"
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none"
                  required
                  disabled={!!user}
                />
              </div>

              <button
                type="submit"
                disabled={!selectedTime || !serviceId}
                className="w-full bg-stone-800 text-white p-5 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-stone-700 transition-all"
              >
                Confirmar Reserva
              </button>
            </motion.form>
          ) : (
            <div className="flex items-center justify-center bg-stone-50 rounded-3xl border border-dashed border-stone-300 p-12 text-center text-stone-400">
              <p>Selecciona un día en el calendario para ver horarios.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
