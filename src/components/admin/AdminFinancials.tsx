import { useState, useEffect } from 'react';
import { api } from '../../api';

export const AdminFinancials = () => {
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
