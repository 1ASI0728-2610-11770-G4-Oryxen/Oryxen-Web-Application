export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycleMonths: number;
  features: string;
  isActive: boolean;
}

export interface CheckoutRequest {
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
}

export interface SubscriptionInfo {
  id: string;
  userId: string;
  plan: string;
  status: string;
  startedAt: string;
  expiresAt: string | null;
  nextBillingDate: string | null;
  canceledAt: string | null;
}
