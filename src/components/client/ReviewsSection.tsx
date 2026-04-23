import React, { useState, useEffect } from 'react';
import { Star, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Review } from '../../types';
import { api } from '../../api';

interface ReviewsSectionProps {
  user: User | null;
}

export const ReviewsSection = ({ user }: ReviewsSectionProps) => {
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
    <div className="bg-gradient-to-b from-rose-50/50 to-white p-8 rounded-[3rem] border border-rose-100/50">
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
