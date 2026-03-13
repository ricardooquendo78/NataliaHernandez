import { User, Service, Appointment, Review } from './types';

const fetchApi = async (path: string, options?: RequestInit) => {
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'API Error');
  }
  return res.json();
};

export const api = {
  auth: {
    login: (data: any) => fetchApi('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => fetchApi('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },
  users: {
    update: (id: number, data: any) => fetchApi(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  services: {
    list: () => fetchApi('/api/services'),
    create: (data: any) => fetchApi('/api/services', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => fetchApi(`/api/services/${id}`, { method: 'DELETE' }),
  },
  availability: {
    get: (date: string) => fetchApi(`/api/availability/${date}`),
    set: (data: { date: string; slots: string[] }) => fetchApi('/api/availability', { method: 'POST', body: JSON.stringify(data) }),
  },
  appointments: {
    list: () => fetchApi('/api/appointments'),
    create: (data: any) => fetchApi('/api/appointments', { method: 'POST', body: JSON.stringify(data) }),
    complete: (id: number, price_charged: number) => fetchApi(`/api/appointments/${id}/complete`, { method: 'PUT', body: JSON.stringify({ price_charged }) }),
  },
  financials: {
    list: () => fetchApi('/api/financials'),
  },
  promotions: {
    list: () => fetchApi('/api/promotions'),
  },
  reviews: {
    list: () => fetchApi('/api/reviews'),
    create: (data: any) => fetchApi('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
  },
};
