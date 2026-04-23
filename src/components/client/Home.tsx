import { Calendar, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '../../types';
import { ServicesList } from '../ui/ServicesList';
import { ReviewsSection } from './ReviewsSection';
import fondoImg from '../../images/fondo.jfif';

interface HomeProps {
  user: User | null;
  onNavigate: (page: string) => void;
}

export const Home = ({ user, onNavigate }: HomeProps) => {
  return (
    <div className="space-y-16 pb-20">
      <section className="relative h-[50vh] rounded-[3rem] overflow-hidden">
        <img
          src={fondoImg}
          alt="Lashes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col items-center justify-center text-white p-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-serif italic mb-4 text-center"
          >
            Luce tu mejor versión
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-light tracking-[0.3em] uppercase"
          >
            Especialista en cejas y pestañas
          </motion.p>
        </div>
      </section>

      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-serif italic">Nuestros Servicios</h2>
          <p className="text-stone-400 font-mono text-xs uppercase tracking-widest">Excelencia en cada aplicación</p>
        </div>
        <ServicesList />
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
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-800 group-hover:text-white transition-all duration-500">
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
