import { describe, expect, it, vi } from "vitest";
import { applyCoupon, shouldShowRetryBanner, submitCheckout } from "../buggy-checkout";
import { submitOrder } from "../src/checkout-flow";

describe("checkout baseline reproductions", () => {
  it("reproduces the empty-body JSON failure", async () => {
    await expect(submitCheckout({ cartId: "cart-1" }, async () => new Response(null, { status: 204 })))
      .rejects.toThrow();
  });

  it("reproduces numeric poisoning and stale retry UI", () => {
    expect(applyCoupon(42, undefined)).toBeNaN();
    expect(shouldShowRetryBanner("success")).toBe(true);
  });

  it("reproduces duplicate gateway calls", async () => {
    const gateway = { charge: vi.fn(async () => ({ paymentId: "pay-1" })) };
    await Promise.all([submitOrder("cart-1", 42, gateway), submitOrder("cart-1", 42, gateway)]);
    expect(gateway.charge).toHaveBeenCalledTimes(2);
  });

  it("keeps the malformed 4xx payload on the error path", async () => {
    await expect(submitCheckout({ cartId: "cart-1" }, async () => new Response("not json", { status: 400 })))
      .rejects.toThrow("400");
  });
});