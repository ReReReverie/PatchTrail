import { describe, expect, it } from "vitest";
import { applyCoupon, shouldShowRetryBanner, submitCheckout } from "../buggy-checkout";

describe("checkout learner regression suite", () => {
  it("handles 204, absent discounts, and success state", async () => {
    await expect(submitCheckout({ cartId: "cart-1" }, async () => new Response(null, { status: 204 })))
      .resolves.toBeNull();
    expect(applyCoupon(42, undefined)).toBe(42);
    expect(shouldShowRetryBanner("success")).toBe(false);
  });
});
