export type CheckoutResponse = {
  orderId: string;
  total: number;
  coupon?: string;
};

export async function submitCheckout(
  input: { cartId: string; coupon?: string },
  request: (input: unknown) => Promise<Response>,
): Promise<CheckoutResponse | null> {
  const response = await request(input);

  if (!response.ok) {
    throw new Error(`Checkout failed: ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json() as Promise<CheckoutResponse>;
}

export function applyCoupon(total: number, discount: number | undefined): number {
  return total - (discount ?? 0);
}

export function shouldShowRetryBanner(
  paymentStatus: "idle" | "processing" | "success" | "failed",
): boolean {
  return paymentStatus === "processing" || paymentStatus === "failed";
}
