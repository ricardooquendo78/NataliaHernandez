import { useState, useEffect } from 'react';
import { User } from './types';
import {
  Calendar,
  User as UserIcon,
  LogOut,
  Settings,
  DollarSign,
  Phone,
  CheckCircle,
  Menu,
  X,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Imports de componentes modularizados
import { Login } from './components/auth/Login';
import { Home } from './components/client/Home';
import { Booking } from './components/client/Booking';
import { Profile } from './components/client/Profile';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ServicesList } from './components/ui/ServicesList';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [adminTab, setAdminTab] = useState<'calendar' | 'financials' | 'clients' | 'services' | 'history' | 'recoveries'>('calendar');

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        setIsKeyboardOpen(true);
      }
    };
    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
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

  if (page === 'login') return <Login onLogin={handleLogin} onBack={() => setPage('home')} />;

  return (
    <div className="h-[100dvh] flex flex-col bg-[#fffafa] text-stone-800 font-sans selection:bg-rose-200/50 overflow-hidden">
      {/* Navigation */}
      <nav 
        className={`shrink-0 z-50 bg-white/90 backdrop-blur-xl border-b border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] ${isKeyboardOpen ? 'hidden' : 'block'}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div
            onClick={() => setPage('home')}
            className="text-2xl font-serif italic cursor-pointer tracking-tighter"
          >
            Natalia Hernandez
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setPage('home')} className="text-sm font-medium hover:text-rose-600 transition-colors">Inicio</button>
            {user?.role !== 'admin' && <button onClick={() => setPage('booking')} className="text-sm font-medium hover:text-rose-600 transition-colors">Citas</button>}
            {user?.role === 'admin' && <button onClick={() => setPage('admin')} className="text-sm font-medium hover:text-rose-600 transition-colors">Admin</button>}
            {user ? (
              <div className="flex items-center gap-4">
                <button onClick={() => setPage('profile')} className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center overflow-hidden border border-stone-200">
                  {user.photo_url ? <img src={user.photo_url} className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                </button>
                <button onClick={handleLogout} className="text-stone-400 hover:text-red-500"><LogOut size={20} /></button>
              </div>
            ) : (
              <button onClick={() => setPage('login')} className="bg-gradient-to-r from-rose-800 to-rose-950 text-white px-6 py-2 rounded-full text-sm font-medium shadow-md shadow-rose-900/10 active:scale-95 transition-all">Entrar</button>
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
      <div className="flex-1 overflow-y-auto w-full relative">
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
            {page === 'admin' && user?.role === 'admin' && <AdminDashboard tab={adminTab} setTab={setAdminTab} />}
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
                  <p className="text-xl">Avenida 35 # 55 - 71 Niquia, Bello</p>
                </div>
                <div className="space-y-4">
                  <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">WhatsApp</p>
                  <p className="text-xl">+57 3233597721</p>
                </div>
                <div className="space-y-4">
                  <p className="text-stone-500 font-mono text-xs uppercase tracking-widest">Horarios</p>
                  <p className="text-xl">Lunes a Sábado: 6:00 AM - 8:00 PM</p>
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
        <footer className="border-t border-stone-100 bg-white py-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xl font-serif italic mb-2">Natalia Hernandez</p>
            <p className="text-stone-400 text-xs font-mono uppercase tracking-widest">© 2026 Todos los derechos reservados</p>
          </div>
        </footer>
      </div>

      {/* Admin Bottom Navigation */}
      {page === 'admin' && user?.role === 'admin' && (
        <div 
          className={`shrink-0 z-50 bg-white/90 backdrop-blur-xl border-t border-stone-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex gap-4 overflow-x-auto pb-[max(1rem,env(safe-area-inset-bottom))] ${isKeyboardOpen ? 'hidden' : 'flex'}`}
        >
          {[
            { id: 'calendar', label: 'Calendario', icon: Calendar },
            { id: 'history', label: 'Historial', icon: CheckCircle },
            { id: 'financials', label: 'Finanzas', icon: DollarSign },
            { id: 'clients', label: 'Clientas', icon: UserIcon },
            { id: 'services', label: 'Servicios', icon: Settings },
            { id: 'recoveries', label: 'Recuperaciones', icon: Key },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setAdminTab(t.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 ${
                adminTab === t.id 
                  ? 'bg-gradient-to-r from-rose-800 to-rose-950 text-white shadow-xl shadow-rose-900/20' 
                  : 'bg-white text-stone-500 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <t.icon size={18} />
              <span className="font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
