import { Role, FacilityKind, BookingStatus, PaymentStatus } from "@prisma/client";

export type AppRole = Role;

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  role: AppRole;
}

export interface FacilityWithAvailability {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  photos: unknown;
  amenities: unknown;
  facilityType: {
    kind: FacilityKind;
    name: string;
  };
  availability: DateAvailability[];
}

export interface DateAvailability {
  date: string;
  available: boolean;
  price: number;
}

export interface BookingQuote {
  subtotal: number;
  taxAmount: number;
  feeAmount: number;
  totalAmount: number;
  currency: string;
  holdId: string;
}

export interface BookingDetails {
  id: string;
  code: string;
  status: BookingStatus;
  startDate: Date;
  endDate: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  totalAmount: number;
  currency: string;
  facilityUnit: {
    id: string;
    name: string;
    facilityType: {
      kind: FacilityKind;
      name: string;
    };
  };
  payments: Array<{
    id: string;
    status: PaymentStatus;
    amount: number;
  }>;
}

export interface PaymentIntent {
  checkoutUrl?: string;
  clientSecret?: string;
  provider: "PAYMONGO";
}
