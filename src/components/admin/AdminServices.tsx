import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Service } from '../../types';
import { api } from '../../api';
import { fileToBase64 } from '../../utils/helpers';

export const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.services.list().then(setServices);
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setImageUrl('');
    setPrice('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !imageUrl) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const numericPrice = Number(price.replace(/\D/g, ''));
      if (editingId) {
        await api.services.update(editingId, { name, description, image_url: imageUrl, price: numericPrice });
        setSuccess('Servicio actualizado correctamente');
      } else {
        await api.services.create({ name, description, image_url: imageUrl, price: numericPrice });
        setSuccess('Servicio agregado correctamente');
      }
      resetForm();
      const updated = await api.services.list();
      setServices(updated);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || (editingId ? 'Error al actualizar servicio' : 'Error al agregar servicio'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setName(service.name);
    setDescription(service.description);
    setImageUrl(service.image_url);
    setPrice((service.price || '').toString());
    setEditingId(service.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
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

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-3xl border border-stone-100">
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
            <label className="text-xs font-mono uppercase text-stone-400 ml-2">Precio</label>
            <input
              type="text"
              inputMode="numeric"
              value={price}
              onChange={e => {
                // Remove non-digits and allow formatting easily
                const rawValue = e.target.value.replace(/\D/g, '');
                setPrice(rawValue ? Number(rawValue).toLocaleString('es-CO') : '');
              }}
              placeholder="Ej: 150000"
              className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none"
              required
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-mono uppercase text-stone-400 ml-2">Imagen del Servicio</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                id="service-image-upload"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const base64 = await fileToBase64(file);
                    setImageUrl(base64);
                  }
                }}
                className="hidden"
              />
              <label
                htmlFor="service-image-upload"
                className="w-full p-4 bg-rose-50 border-2 border-dashed border-rose-200 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:bg-rose-100 transition-all text-rose-800 font-medium overflow-hidden"
              >
                {imageUrl ? (
                  <div className="flex items-center gap-3 w-full">
                    <img src={imageUrl} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <span className="truncate text-xs">Imagen seleccionada</span>
                  </div>
                ) : (
                  <><Plus size={18} /> Subir desde Galería</>
                )}
              </label>
            </div>
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
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-stone-800 text-white p-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 font-bold hover:bg-stone-700 transition"
          >
            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editingId ? "Guardar Cambios" : <><Plus size={20} /> Agregar Servicio</>}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex-none bg-stone-100 text-stone-600 p-4 rounded-2xl font-bold hover:bg-stone-200 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {error && <p className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
      {success && <p className="text-emerald-600 text-sm bg-emerald-50 p-4 rounded-xl border border-emerald-100">{success}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(s => (
          <div key={s.id} className="flex gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
            <img src={s.image_url} className="w-20 h-20 object-cover rounded-xl" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{s.name} <span className="text-rose-600 font-mono text-sm ml-2">${s.price?.toLocaleString() || 0}</span></p>
              <p className="text-stone-500 text-xs line-clamp-2">{s.description}</p>
            </div>
            <div className="flex flex-col gap-2 self-start border-l border-stone-100 pl-4">
              <button type="button" onClick={() => handleEdit(s)} className="text-stone-400 hover:bg-stone-100 p-2 rounded-full transition" title="Editar servicio">
                <Edit2 size={20} />
              </button>
              <button type="button" onClick={() => handleDelete(s.id)} className="text-red-400 hover:bg-red-50 p-2 rounded-full transition" title="Eliminar servicio">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
