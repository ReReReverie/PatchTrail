import { afterEach, describe, expect, it, vi } from "vitest";
import { chargeOnce, clearCompletedPayments } from "../payment-idempotency-senior";

describe("payment baseline reproductions", () => {
  afterEach(() => clearCompletedPayments());

  it("shares a result across accounts", async () => {
    const charge = vi
      .fn()
      .mockResolvedValueOnce({ paymentId: "pay-us", accountId: "account-us", amount: 10 })
      .mockResolvedValueOnce({ paymentId: "pay-eu", accountId: "account-eu", amount: 10 });
    await chargeOnce("account-us", "checkout-1", charge);
    const second = await chargeOnce("account-eu", "checkout-1", charge);
    expect(second.accountId).toBe("account-us");
    expect(charge).toHaveBeenCalledTimes(1);
  });

  it("charges concurrent duplicate requests twice", async () => {
    const charge = vi.fn(async () => ({ paymentId: "pay-1", accountId: "account-1", amount: 10 }));
    await Promise.all([chargeOnce("account-1", "checkout-1", charge), chargeOnce("account-1", "checkout-1", charge)]);
    expect(charge).toHaveBeenCalledTimes(2);
  });
});
