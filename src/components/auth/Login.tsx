import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../../types';
import { api } from '../../api';

interface LoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

export const Login = ({ onLogin, onBack }: LoginProps) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (mode === 'register') {
        const user = await api.auth.register({ email, phone, password, name });
        onLogin(user);
      } else if (mode === 'login') {
        const user = await api.auth.login({ email, password });
        onLogin(user);
      } else if (mode === 'forgot') {
        const res = await api.auth.forgotPassword({ email });
        setSuccess(res.message);
        setMode('reset');
      } else if (mode === 'reset') {
        const res = await api.auth.resetPassword({ email, code, newPassword: password });
        setSuccess(res.message);
        setTimeout(() => {
          setMode('login');
          setPassword('');
          setCode('');
          setSuccess('');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-stone-100 p-4 relative">
      <button 
        onClick={onBack} 
        className="absolute top-6 left-6 md:top-10 md:left-10 text-stone-500 hover:text-stone-800 flex items-center gap-2 font-medium transition-colors hover:-translate-x-1 duration-300"
      >
        <ChevronLeft size={20} />
        Volver
      </button>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-rose-200/50 w-full max-w-md border border-white"
      >
        <h2 className="text-3xl font-serif italic text-stone-800 mb-6 text-center">
          {mode === 'register' ? 'Crear Cuenta' : mode === 'forgot' ? 'Recuperar Contraseña' : mode === 'reset' ? 'Nueva Contraseña' : 'Bienvenida'}
        </h2>

        {mode === 'forgot' && (
          <p className="text-stone-500 text-sm mb-6 text-center leading-relaxed">
            Ingresa tu correo y te enviaremos un código de recuperación.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
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
            <label className="block text-xs font-mono uppercase text-stone-500 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 disabled:opacity-50"
              required
              disabled={mode === 'reset'}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono uppercase text-stone-500 mb-1">Teléfono (WhatsApp)</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          )}

          {mode === 'reset' && (
            <div>
              <label className="block text-xs font-mono uppercase text-stone-500 mb-1">Código de verificación</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ej: 1234"
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 text-center tracking-widest font-bold"
                required
              />
            </div>
          )}

          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-mono uppercase text-stone-500">
                  {mode === 'reset' ? 'Nueva Contraseña' : 'Contraseña'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                    className="text-xs text-stone-500 hover:text-stone-800 underline"
                  >
                    ¿La olvidaste?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400"
                required={mode !== 'forgot'}
              />
            </div>
          )}

          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
          {success && <p className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-xl border border-emerald-100">{success}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-800 to-rose-950 text-white p-4 rounded-xl font-medium hover:shadow-lg hover:shadow-rose-950/20 transition-all active:scale-[0.98]"
          >
            {mode === 'register' ? 'Registrarse' : mode === 'forgot' ? 'Enviar Código' : mode === 'reset' ? 'Guardar y Entrar' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="mt-6 text-center text-stone-500 text-sm">
          {mode === 'login' ? (
            <span>¿No tienes cuenta? <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }} className="text-stone-800 font-semibold underline">Regístrate</button></span>
          ) : (
            <span>¿Ya tienes cuenta? <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }} className="text-stone-800 font-semibold underline">Inicia sesión</button></span>
          )}
        </p>
      </motion.div>
    </div>
  );
};
