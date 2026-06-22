import { apiClient } from '@/services/httpClient';
import type { Plan, CheckoutRequest, CheckoutResponse, SubscriptionInfo } from '@/billing/domain/model/billing.entity';

export class BillingService {
  async getPlans(): Promise<Plan[]> {
    const { data } = await apiClient.get('/plans');
    return data;
  }

  async createCheckout(req: CheckoutRequest): Promise<CheckoutResponse> {
    const { data } = await apiClient.post('/subscriptions/checkout', req);
    return data;
  }

  async getCurrentSubscription(): Promise<SubscriptionInfo> {
    const { data } = await apiClient.get('/subscriptions/current');
    return data;
  }
}

export const billingService = new BillingService();
