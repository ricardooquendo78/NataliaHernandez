import React, { useState } from 'react';
import { User as UserIcon, Star } from 'lucide-react';
import { User } from '../../types';
import { api } from '../../api';
import { fileToBase64 } from '../../utils/helpers';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export const Profile = ({ user, onUpdate }: ProfileProps) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [photoUrl, setPhotoUrl] = useState(user.photo_url || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await api.users.update(user.id, { name, email, phone, photo_url: photoUrl });
    onUpdate({ ...user, name, email, phone, photo_url: photoUrl });
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
          <p className="text-pink-700 text-sm mb-6">Cada 5 citas, ¡la 6ta tiene 25% de descuento!</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className={`h-4 flex-1 rounded-full transition-all ${i <= progress ? 'bg-pink-500' : 'bg-pink-200'
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
            <label className="block text-xs font-mono uppercase text-stone-500 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value.toLowerCase())}
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
            <label className="block text-xs font-mono uppercase text-stone-500 mb-1">Foto de Perfil</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                id="profile-photo-upload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const base64 = await fileToBase64(file);
                    setPhotoUrl(base64);
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="profile-photo-upload"
                className="w-full p-4 bg-rose-50 border-2 border-dashed border-rose-200 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-rose-100 transition-all text-rose-800 font-medium overflow-hidden"
              >
                {photoUrl ? (
                  <div className="flex items-center gap-3 w-full">
                    <img src={photoUrl} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    <span className="truncate text-xs">Foto seleccionada</span>
                  </div>
                ) : (
                  <><UserIcon size={18} /> Subir desde Galería</>
                )}
              </label>
            </div>
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
