export type Treatment = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BookingStatus = "pending" | "confirmed" | "completed" | "no_show" | "cancelled";

export type NamedRef = {
  slug: string;
  name: string;
};

export type Slot = {
  start_at: string;
  time: string;
};

export type CreatedBooking = {
  code: string;
  status: BookingStatus;
  patient_name: string;
  treatment: NamedRef;
  therapist: NamedRef;
  start_at: string;
  end_at: string;
  price: number;
  note: string;
};

export type PublicBooking = CreatedBooking & {
  cancel_reason: string;
  can_cancel: boolean;
  cancel_deadline: string;
};

export type PromoTreatment = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
};

export type Promo = {
  id: number;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  treatments: PromoTreatment[];
  created_at: string;
  updated_at: string;
};

export type PublicClinic = {
  clinic_name: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  opening_hours_text: string;
  min_booking_lead_minutes: number;
  max_booking_days_ahead: number;
  cancel_deadline_hours: number;
};

export type Therapist = {
  id: number;
  name: string;
  slug: string;
  title: string;
  bio: string;
  photo_url: string;
  is_active: boolean;
  has_account: boolean;
  created_at: string;
  updated_at: string;
};
