import type { Consultation } from './consultations';
import type { Initiative } from './initiatives';

export interface Booking {
  id: string;
  reference: string;
  consultationId: string;
  fullName: string;
  contactNumber: string;
  email: string;
  userType: string;
  companyOrOrganization: string;
  seats: number;
  sessionDate: string;
  sessionSnapshot: Record<string, unknown>;
  notes: string;
  paymentMethod: string;
  amount: number;
  paymentReference: string;
  paymentSuccess: boolean;
  status: 'confirmed' | 'cancelled' | 'pending_payment';
  consultation?: Consultation;
}

export interface InitiativeApplication {
  id: string;
  applicationReference: string;
  initiativeId: string;
  fullName: string;
  contactNumber: string;
  email: string;
  userType: string;
  userOrOrganizationName: string;
  maritalStatus: string;
  age: number;
  emirate: string;
  income: string;
  familyMembers: number;
  nationality: string;
  notes: string;
  status: 'received' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';
  initiative?: Initiative;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}