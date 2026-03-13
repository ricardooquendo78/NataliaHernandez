import React, { useState, useEffect } from 'react';
import { User, Service, Appointment, Review } from './types';
import { api } from './api';
import { 
  Calendar, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  DollarSign, 
  Star, 
  Phone, 
  Plus, 
  Trash2, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- UTILS ---

const formatTime = (time: string) => {
  if (!time) return '';
  const [hour, minute] = time.split(':');
  const h = parseInt(hour);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minute} ${ampm}`;
};

// --- COMPONENTS ---

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        const user = await api.auth.register({ phone, password, name });
        onLogin(user);
      } else {
        const user = await api.auth.login({ phone, password });
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-3xl font-serif italic text-stone-800 mb-6 text-center">
          {isRegister ? 'Crear Cuenta' : 'Bienvenida'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-mono uppercase text-stone-500 mb-1">Nombre</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-mono uppercase text-stone-500 mb-1">Teléfono</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-stone-500 mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-stone-800 text-white p-4 rounded-xl font-medium hover:bg-stone-700 transition-colors"
          >
            {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>
        <p className="mt-6 text-center text-stone-500 text-sm">
          {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'} 
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="ml-1 text-stone-800 font-semibold underline"
          >
            {isRegister ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

const ServicesList = ({ onBook }: { onBook?: () => void }) => {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    api.services.list().then(setServices);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map(service => (
        <motion.div 
          key={service.id}
          whileHover={{ y: -10 }}
          className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden flex flex-col"
        >
          <div className="h-64 overflow-hidden">
            <img 
              src={service.image_url} 
              alt={service.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="p-8 flex-1 flex flex-col">
            <h3 className="text-2xl font-serif mb-4">{service.name}</h3>
            <p className="text-stone-500 text-sm mb-6 flex-1">{service.description}</p>
            {onBook && (
              <button 
                onClick={onBook}
                className="w-full bg-stone-800 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-stone-700 transition-colors"
              >
                Reservar Ahora
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const Home = ({ user, onNavigate }: { user: User | null, onNavigate: (page: string) => void }) => {
  return (
    <div className="space-y-16 pb-20">
      <section className="relative h-[50vh] rounded-[3rem] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=1000" 
          alt="Lashes" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-end text-white p-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-serif italic mb-4 text-center"
          >
            Look your best version
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-light tracking-[0.3em] uppercase"
          >
            Especialistas en pestañas
          </motion.p>
        </div>
      </section>

      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-serif italic">Nuestros Servicios</h2>
          <p className="text-stone-400 font-mono text-xs uppercase tracking-widest">Excelencia en cada aplicación</p>
        </div>
        <ServicesList onBook={() => onNavigate('booking')} />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { icon: Calendar, title: 'Citas', desc: 'Reserva en línea.', page: 'booking' },
          { icon: Phone, title: 'Contacto', desc: 'Atención personalizada.', page: 'contact' }
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            onClick={() => onNavigate(item.page)}
            className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-stone-100 cursor-pointer group"
          >
            <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-stone-800 group-hover:text-white transition-all duration-300">
              <item.icon size={28} />
            </div>
            <h3 className="text-2xl font-serif mb-3">{item.title}</h3>
            <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <ReviewsSection user={user} />
    </div>
  );
};

const ReviewsSection = ({ user }: { user: User | null }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.reviews.list().then(setReviews);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await api.reviews.create({ user_id: user.id, rating, comment });
    setComment('');
    setShowForm(false);
    api.reviews.list().then(setReviews);
  };

  return (
    <div className="bg-stone-50 p-8 rounded-3xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif italic">Reseñas</h2>
        {user && user.role === 'premium' && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="text-stone-800 font-mono text-xs uppercase underline tracking-widest"
          >
            {showForm ? 'Cerrar' : 'Agregar Reseña'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="mb-8 space-y-4 overflow-hidden"
          >
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star 
                  key={s} 
                  size={20} 
                  className={s <= rating ? 'fill-stone-800 text-stone-800' : 'text-stone-300'} 
                  onClick={() => setRating(s)}
                />
              ))}
            </div>
            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia..."
              className="w-full p-4 bg-white border border-stone-200 rounded-2xl h-32 focus:outline-none"
              required
            />
            <button className="bg-stone-800 text-white px-6 py-3 rounded-xl">Publicar</button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {reviews.map(review => (
          <div key={review.id} className="border-b border-stone-200 pb-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-stone-200 rounded-full overflow-hidden">
                {review.photo_url ? (
                  <img src={review.photo_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-500">
                    <UserIcon size={20} />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-stone-800">{review.user_name}</p>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className={i < review.rating ? 'fill-stone-800 text-stone-800' : 'text-stone-300'} />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-stone-600 italic">"{review.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [tab, setTab] = useState<'calendar' | 'financials' | 'clients' | 'services' | 'history'>('calendar');
  
  return (
    <div className="space-y-8">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {[
          { id: 'calendar', label: 'Calendario', icon: Calendar },
          { id: 'history', label: 'Historial', icon: CheckCircle },
          { id: 'financials', label: 'Finanzas', icon: DollarSign },
          { id: 'clients', label: 'Clientas', icon: UserIcon },
          { id: 'services', label: 'Servicios', icon: Settings },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all ${
              tab === t.id ? 'bg-stone-800 text-white shadow-lg' : 'bg-white text-stone-500 border border-stone-100'
            }`}
          >
            <t.icon size={18} />
            <span className="font-medium">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-stone-100 min-h-[60vh]">
        {tab === 'calendar' && <AdminCalendar />}
        {tab === 'history' && <AdminHistory />}
        {tab === 'financials' && <AdminFinancials />}
        {tab === 'clients' && <AdminClients />}
        {tab === 'services' && <AdminServices />}
      </div>
    </div>
  );
};

const AdminCalendar = () => {
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
    const newSlots = slots.includes(hour) ? slots.filter(s => s !== hour) : [...slots, hour];
    setSlots(newSlots);
    await api.availability.set({ date: selectedDate, slots: newSlots });
  };

  const handleComplete = async () => {
    if (!showCompleteModal) return;
    await api.appointments.complete(showCompleteModal.id, parseFloat(price));
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
              className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                selectedDate === dateStr ? 'bg-stone-800 text-white' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
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
                <div className="grid grid-cols-3 gap-2">
                  {['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map(hour => (
                    <button
                      key={hour}
                      onClick={() => handleToggleSlot(hour)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        slots.includes(hour) ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-white text-stone-400 border-stone-200'
                      } border`}
                    >
                      {formatTime(hour)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-xs font-mono uppercase text-stone-500 mb-4 tracking-widest">Citas Agendadas</h5>
                <div className="space-y-3">
                  {appointments.filter(a => a.date === selectedDate && a.status === 'pending').map(a => (
                    <div key={a.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-stone-800">{formatTime(a.time)} - {a.user_name || a.casual_name}</p>
                        <p className="text-xs text-stone-500">{a.service_name}</p>
                        <p className="text-xs text-stone-400">{a.casual_phone || 'Premium'}</p>
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
              type="number" 
              value={price}
              onChange={e => setPrice(e.target.value)}
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

const AdminHistory = () => {
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

const AdminFinancials = () => {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    api.financials.list().then(setData);
  }, []);

  const total = data.reduce((acc, curr) => acc + (curr.price_charged || 0), 0);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyTotal = data.filter(d => {
    const date = new Date(d.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).reduce((acc, curr) => acc + (curr.price_charged || 0), 0);

  return (
    <div className="space-y-8">
      <h3 className="text-3xl font-serif italic">Ingresos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-stone-800 text-white p-8 rounded-3xl">
          <p className="text-xs font-mono uppercase opacity-60 mb-2">Este Mes</p>
          <p className="text-4xl font-serif">${monthlyTotal.toLocaleString()}</p>
        </div>
        <div className="bg-stone-100 p-8 rounded-3xl">
          <p className="text-xs font-mono uppercase text-stone-500 mb-2">Total Histórico</p>
          <p className="text-4xl font-serif text-stone-800">${total.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-mono uppercase text-stone-400 tracking-widest">Últimas Transacciones</h4>
        {data.slice().reverse().map((d, i) => (
          <div key={i} className="flex justify-between items-center p-4 border-b border-stone-100">
            <span className="text-stone-600">{new Date(d.date).toLocaleDateString()}</span>
            <span className="font-bold text-emerald-600">+${d.price_charged?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminClients = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    api.promotions.list().then(setUsers);
  }, []);

  return (
    <div className="space-y-8">
      <h3 className="text-3xl font-serif italic">Nuestras Clientas</h3>
      <p className="text-stone-500">Listado de usuarias premium y seguimiento de sus beneficios.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map(u => {
          const progress = u.appointment_count % 6;
          const isNextPink = progress === 5;
          return (
            <div key={u.id} className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-stone-200 rounded-full overflow-hidden">
                    {u.photo_url ? <img src={u.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-400"><UserIcon size={20} /></div>}
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-tight">{u.name}</p>
                    <p className="text-sm text-stone-500">{u.phone}</p>
                  </div>
                </div>
                {isNextPink && (
                  <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Próxima Pink
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div 
                      key={i} 
                      className={`h-2 flex-1 rounded-full transition-all ${
                        i <= progress ? 'bg-stone-800' : 'bg-stone-200'
                      } ${i === 6 && isNextPink ? 'bg-pink-400 animate-pulse' : ''}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-stone-400">
                  <span>{progress} / 6 Citas</span>
                  <span>Total: {u.appointment_count}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.services.list().then(setServices);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !imageUrl) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.services.create({ name, description, image_url: imageUrl });
      setName('');
      setDescription('');
      setImageUrl('');
      setSuccess('Servicio agregado correctamente');
      const updated = await api.services.list();
      setServices(updated);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al agregar servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.services.delete(id);
      const updated = await api.services.list();
      setServices(updated);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar servicio');
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-3xl font-serif italic">Gestionar Servicios</h3>
      
      <form onSubmit={handleAdd} className="space-y-4 bg-white p-6 rounded-3xl border border-stone-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-stone-400 ml-2">Nombre del Servicio</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Pestañas Clásicas"
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-stone-400 ml-2">URL de Imagen</label>
            <input 
              type="url" 
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none"
              required
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-mono uppercase text-stone-400 ml-2">Descripción</label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe el servicio..."
            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none h-24"
            required
          />
        </div>
        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-stone-800 text-white p-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 font-bold"
        >
          {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={20} /> Agregar Servicio</>}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
      {success && <p className="text-emerald-600 text-sm bg-emerald-50 p-4 rounded-xl border border-emerald-100">{success}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(s => (
          <div key={s.id} className="flex gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
            <img src={s.image_url} className="w-20 h-20 object-cover rounded-xl" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{s.name}</p>
              <p className="text-stone-500 text-xs line-clamp-2">{s.description}</p>
            </div>
            <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-full self-start">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Booking = ({ user }: { user: User | null }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

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
  }, []);

  useEffect(() => {
    if (selectedDate) {
      api.availability.get(selectedDate).then(setAvailableSlots);
      api.appointments.list().then(apps => {
        const booked = apps.filter(a => a.date === selectedDate).map(a => a.time);
        setBookedSlots(booked);
      });
    }
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.appointments.create({
      user_id: user?.id,
      casual_name: user ? null : name,
      casual_phone: user ? null : phone,
      service_id: parseInt(serviceId),
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
        <button onClick={() => window.location.reload()} className="mt-8 bg-stone-800 text-white px-8 py-3 rounded-xl">Volver</button>
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
              const isPast = new Date(dateStr) < new Date(new Date().setHours(0,0,0,0));
              return (
                <button
                  key={day}
                  disabled={isPast}
                  onClick={() => { setSelectedDate(dateStr); setSelectedTime(null); }}
                  className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                    selectedDate === dateStr ? 'bg-stone-800 text-white shadow-lg' : isPast ? 'text-stone-200 cursor-not-allowed' : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
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
                <div className="grid grid-cols-3 gap-3">
                  {availableSlots.map(hour => {
                    const isBooked = bookedSlots.includes(hour);
                    return (
                      <button
                        key={hour}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedTime(hour)}
                        className={`p-3 rounded-xl text-sm font-medium border transition-all ${
                          selectedTime === hour ? 'bg-stone-800 text-white border-stone-800' : isBooked ? 'bg-stone-100 text-stone-300 border-stone-100 cursor-not-allowed' : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
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

const Profile = ({ user, onUpdate }: { user: User, onUpdate: (user: User) => void }) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [photoUrl, setPhotoUrl] = useState(user.photo_url || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await api.users.update(user.id, { name, phone, photo_url: photoUrl });
    onUpdate({ ...user, name, phone, photo_url: photoUrl });
    setSaving(false);
  };

  const progress = user.appointment_count % 6;

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-20">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 flex flex-col items-center">
        <div className="w-32 h-32 bg-stone-200 rounded-full overflow-hidden mb-6 border-4 border-white shadow-lg">
          {photoUrl ? (
            <img src={photoUrl} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400">
              <UserIcon size={48} />
            </div>
          )}
        </div>
        <h2 className="text-3xl font-serif italic mb-1">{user.name}</h2>
        <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">Usuaria Premium</p>
      </div>

      {user.role !== 'admin' && (
        <div className="bg-pink-50 p-8 rounded-3xl border border-pink-100">
          <h3 className="text-xl font-serif text-pink-800 mb-4 flex items-center gap-2">
            <Star className="fill-pink-400 text-pink-400" />
            Tu Cita Pink
          </h3>
          <p className="text-pink-700 text-sm mb-6">Cada 5 citas, ¡la 6ta tiene 50% de descuento!</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div 
                key={i} 
                className={`h-4 flex-1 rounded-full transition-all ${
                  i <= progress ? 'bg-pink-500' : 'bg-pink-200'
                } ${i === 6 && progress === 5 ? 'animate-pulse' : ''}`}
              />
            ))}
          </div>
          <p className="text-xs font-mono text-pink-400 mt-3 text-right">
            {progress} / 6 citas para tu descuento
          </p>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 space-y-6">
        <h3 className="text-xl font-serif mb-4">Editar Perfil</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-stone-500 mb-1">Nombre</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-stone-500 mb-1">Teléfono</label>
            <input 
              type="tel" 
              value={phone} 
              onChange={e => setPhone(e.target.value)}
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-stone-500 mb-1">URL de Foto</label>
            <input 
              type="text" 
              value={photoUrl} 
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none"
            />
          </div>
        </div>
        <button 
          disabled={saving}
          className="w-full bg-stone-800 text-white p-4 rounded-2xl font-bold hover:bg-stone-700 transition-all disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    setPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setPage('home');
  };

  if (page === 'login') return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans selection:bg-stone-200">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            onClick={() => setPage('home')} 
            className="text-2xl font-serif italic cursor-pointer tracking-tighter"
          >
            Lash Best Version
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setPage('home')} className="text-sm font-medium hover:text-stone-500">Inicio</button>
            {user?.role !== 'admin' && <button onClick={() => setPage('booking')} className="text-sm font-medium hover:text-stone-500">Citas</button>}
            {user?.role === 'admin' && <button onClick={() => setPage('admin')} className="text-sm font-medium hover:text-stone-500">Admin</button>}
            {user ? (
              <div className="flex items-center gap-4">
                <button onClick={() => setPage('profile')} className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center overflow-hidden border border-stone-200">
                  {user.photo_url ? <img src={user.photo_url} className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                </button>
                <button onClick={handleLogout} className="text-stone-400 hover:text-red-500"><LogOut size={20} /></button>
              </div>
            ) : (
              <button onClick={() => setPage('login')} className="bg-stone-800 text-white px-6 py-2 rounded-full text-sm font-medium">Entrar</button>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-white p-8 pt-24 md:hidden"
          >
            <div className="flex flex-col gap-6 text-2xl font-serif italic">
              <button onClick={() => { setPage('home'); setIsMenuOpen(false); }}>Inicio</button>
              {user?.role !== 'admin' && <button onClick={() => { setPage('booking'); setIsMenuOpen(false); }}>Citas</button>}
              {user?.role === 'admin' && <button onClick={() => { setPage('admin'); setIsMenuOpen(false); }}>Admin</button>}
              {user && <button onClick={() => { setPage('profile'); setIsMenuOpen(false); }}>Mi Perfil</button>}
              {user ? (
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-red-500">Salir</button>
              ) : (
                <button onClick={() => { setPage('login'); setIsMenuOpen(false); }}>Entrar</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {page === 'home' && <Home user={user} onNavigate={setPage} />}
            {page === 'booking' && <Booking user={user} />}
            {page === 'admin' && user?.role === 'admin' && <AdminDashboard />}
            {page === 'profile' && user && <Profile user={user} onUpdate={setUser} />}
            {page === 'services' && (
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-5xl font-serif italic">Nuestros Servicios</h2>
                  <p className="text-stone-500 max-w-2xl mx-auto">Descubre nuestras técnicas especializadas para realzar tu mirada. Utilizamos materiales de la más alta calidad.</p>
                </div>
                <ServicesList onBook={() => setPage('booking')} />
              </div>
            )}
            {page === 'contact' && (
              <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl shadow-sm border border-stone-100 text-center space-y-8">
                <h2 className="text-4xl font-serif italic">Contacto</h2>
                <div className="space-y-4">
                  <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">Ubicación</p>
                  <p className="text-xl">Calle 123 #45-67, Ciudad Jardín</p>
                </div>
                <div className="space-y-4">
                  <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">WhatsApp</p>
                  <p className="text-xl">+57 300 123 4567</p>
                </div>
                <div className="space-y-4">
                  <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">Horarios</p>
                  <p className="text-xl">Lunes a Sábado: 6:00 AM - 10:00 PM</p>
                </div>
                <div className="flex justify-center gap-4 pt-8">
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-800 hover:bg-stone-800 hover:text-white transition-all cursor-pointer">
                    <Phone size={20} />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-2xl font-serif italic mb-4">Lash Best Version</p>
          <p className="text-stone-400 text-sm font-mono uppercase tracking-widest">© 2026 Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}
