import { describe, expect, it, vi } from "vitest";
import { applyCoupon, shouldShowRetryBanner, submitCheckout } from "../fixed/buggy-checkout";
import { submitOrder } from "../fixed/checkout-flow";

describe("checkout fixed reference", () => {
  it("accepts 204 and still parses JSON success", async () => {
    await expect(submitCheckout({ cartId: "cart-1" }, async () => new Response(null, { status: 204 })))
      .resolves.toBeNull();
    await expect(submitCheckout({ cartId: "cart-1" }, async () => Response.json({ orderId: "o-1", total: 42 })))
      .resolves.toEqual({ orderId: "o-1", total: 42 });
  });

  it("preserves totals, hides retry UI after success, and reports 4xx status", async () => {
    expect(applyCoupon(42, undefined)).toBe(42);
    expect(shouldShowRetryBanner("success")).toBe(false);
    await expect(submitCheckout({ cartId: "cart-1" }, async () => new Response("not json", { status: 400 })))
      .rejects.toThrow("400");
  });

  it("deduplicates concurrent submits and permits a retry after failure", async () => {
    const gateway = {
      charge: vi.fn()
        .mockRejectedValueOnce(new Error("gateway timeout"))
        .mockResolvedValueOnce({ paymentId: "pay-2" }),
    };
    await expect(submitOrder("cart-1", 42, gateway)).rejects.toThrow("timeout");
    await expect(submitOrder("cart-1", 42, gateway)).resolves.toEqual({ paymentId: "pay-2" });
    expect(gateway.charge).toHaveBeenCalledTimes(2);

    const concurrentGateway = { charge: vi.fn(async () => ({ paymentId: "pay-3" })) };
    await Promise.all([submitOrder("cart-2", 42, concurrentGateway), submitOrder("cart-2", 42, concurrentGateway)]);
    expect(concurrentGateway.charge).toHaveBeenCalledTimes(1);
  });
});