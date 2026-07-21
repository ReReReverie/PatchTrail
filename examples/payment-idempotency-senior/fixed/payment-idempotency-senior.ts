export interface PaymentResult {
  paymentId: string;
  accountId: string;
  amount: number;
}

const completedPayments = new Map<string, PaymentResult>();
const pendingPayments = new Map<string, Promise<PaymentResult>>();

export async function chargeOnce(
  accountId: string,
  idempotencyKey: string,
  charge: () => Promise<PaymentResult>,
): Promise<PaymentResult> {
  const key = `${accountId}:${idempotencyKey}`;
  const cached = completedPayments.get(key);
  if (cached) return cached;

  const pending = pendingPayments.get(key);
  if (pending) return pending;

  const request = charge().then((result) => {
    completedPayments.set(key, result);
    return result;
  }).finally(() => pendingPayments.delete(key));
  pendingPayments.set(key, request);
  return request;
}

export function clearCompletedPayments(): void {
  completedPayments.clear();
  pendingPayments.clear();
}
