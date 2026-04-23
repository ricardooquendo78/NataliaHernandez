import { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { User } from '../../types';
import { api } from '../../api';

export const AdminClients = () => {
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
                      className={`h-2 flex-1 rounded-full transition-all ${i <= progress ? 'bg-stone-800' : 'bg-stone-200'
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
