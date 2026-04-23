import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Service } from '../../types';
import { api } from '../../api';

interface ServicesListProps {
  onBook?: () => void;
}

export const ServicesList = ({ onBook }: ServicesListProps) => {
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
            <div className="flex justify-between items-start mb-4 gap-4">
              <h3 className="text-2xl font-sans font-bold text-rose-950 tracking-tight">{service.name}</h3>
              <span className="text-rose-800 font-bold text-xl shrink-0">${service.price?.toLocaleString() || 0}</span>
            </div>
            <p className="text-stone-500 text-sm mb-6 flex-1">{service.description}</p>
            {onBook && (
              <button
                onClick={onBook}
                className="w-full bg-gradient-to-r from-rose-800 to-rose-950 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-900/20 hover:scale-[1.02] transition-all"
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
