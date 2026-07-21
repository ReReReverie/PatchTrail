import type { PaymentGateway } from "./payment-gateway";

const inFlight = new Map<string, Promise<{ paymentId: string }>>();

export async function submitOrder(
  cartId: string,
  amount: number,
  gateway: PaymentGateway,
): Promise<{ paymentId: string }> {
  // BUG: duplicate submits are not deduplicated at the checkout boundary.
  return gateway.charge({ cartId, amount });
}

export async function submitOrderFixed(
  cartId: string,
  amount: number,
  gateway: PaymentGateway,
): Promise<{ paymentId: string }> {
  const existing = inFlight.get(cartId);
  if (existing) return existing;

  const request = gateway.charge({ cartId, amount }).finally(() => inFlight.delete(cartId));
  inFlight.set(cartId, request);
  return request;
}
