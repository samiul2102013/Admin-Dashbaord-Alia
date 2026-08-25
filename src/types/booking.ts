export type BookingStatusValue = 'confirmed' | 'cancelled' | 'pending_payment';

export interface BookingSessionSnapshot {
  sessionTitle?: string;
  sessionType?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  timeZone?: string;
  meetingFormat?: string;
  location?: string;
  counselor?: string;
}

export interface Booking {
  id: string;
  reference: string;
  consultationId: string;
  fullName: string;
  contactNumber: string;
  email: string;
  userType?: string;
  companyOrOrganization?: string;
  seats: number;
  sessionDate?: string;
  sessionSnapshot: BookingSessionSnapshot;
  notes?: string;
  paymentMethod?: string;
  amount: string | number;
  paymentReference?: string;
  paymentSuccess: boolean;
  status: BookingStatusValue;
  created_at: string;
  updated_at: string;
}
