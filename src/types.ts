export interface User {
  id: string;
  phone: string;
  name: string;
  role: 'admin' | 'premium';
  photo_url?: string;
  appointment_count: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
}

export interface Appointment {
  id: string;
  user_id?: string;
  casual_name?: string;
  casual_phone?: string;
  service_id: string;
  service_name?: string;
  user_name?: string;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'canceled';
  price_charged?: number;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  photo_url?: string;
  rating: number;
  comment: string;
  date: string;
}
