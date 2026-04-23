import { useState, useEffect } from 'react';
import { api } from '../../api';

export const AdminRecoveries = () => {
  const [codes, setCodes] = useState<any[]>([]);

  useEffect(() => {
    api.auth.getResetCodes().then(setCodes);
  }, []);

  return (
    <div className="space-y-8">
      <h3 className="text-3xl font-serif italic">Recuperaciones Pendientes</h3>
      <p className="text-stone-500">Estos son los códigos activos (expiran en 15 minutos) para las clientas que solicitaron recuperar su contraseña.</p>

      {codes.length === 0 ? (
        <p className="text-stone-400 italic">No hay solicitudes pendientes.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {codes.map((c, i) => (
            <div key={i} className="bg-stone-50 p-6 rounded-3xl border border-stone-100 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{c.name || 'Clienta'}</p>
                  <p className="text-sm text-stone-500">{c.phone}</p>
                </div>
                <span className="bg-rose-100 text-rose-800 font-mono font-bold px-3 py-1 rounded-xl tracking-widest">
                  {c.code}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Expira: {new Date(c.expires_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
