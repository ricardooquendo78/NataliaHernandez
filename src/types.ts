export interface User {
  id: number;
  phone: string;
  name: string;
  role: 'admin' | 'premium';
  photo_url?: string;
  appointment_count: number;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

export interface Appointment {
  id: number;
  user_id?: number;
  casual_name?: string;
  casual_phone?: string;
  service_id: number;
  service_name?: string;
  user_name?: string;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'canceled';
  price_charged?: number;
}

export interface Review {
  id: number;
  user_id: number;
  user_name: string;
  photo_url?: string;
  rating: number;
  comment: string;
  date: string;
}
