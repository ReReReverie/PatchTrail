export type PaymentStatus = "idle" | "processing" | "success" | "failed";

export interface PaymentGateway {
  charge(input: { cartId: string; amount: number }): Promise<{ paymentId: string }>;
}
