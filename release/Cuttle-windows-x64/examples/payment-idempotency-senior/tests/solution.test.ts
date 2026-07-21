import { afterEach, describe, expect, it, vi } from "vitest";
import { chargeOnce, clearCompletedPayments } from "../fixed/payment-idempotency-senior";

describe("payment fixed reference", () => {
  afterEach(() => clearCompletedPayments());

  it("isolates accounts and reuses same-account retries", async () => {
    const charge = vi
      .fn()
      .mockResolvedValueOnce({ paymentId: "pay-us", accountId: "account-us", amount: 10 })
      .mockResolvedValueOnce({ paymentId: "pay-eu", accountId: "account-eu", amount: 10 });
    const first = await chargeOnce("account-us", "checkout-1", charge);
    const second = await chargeOnce("account-eu", "checkout-1", charge);
    expect(first.accountId).toBe("account-us");
    expect(second.accountId).toBe("account-eu");
    expect(await chargeOnce("account-us", "checkout-1", charge)).toBe(first);
    expect(charge).toHaveBeenCalledTimes(2);
  });

  it("charges concurrent duplicates once", async () => {
    const charge = vi.fn(async () => ({ paymentId: "pay-1", accountId: "account-1", amount: 10 }));
    await Promise.all([chargeOnce("account-1", "checkout-1", charge), chargeOnce("account-1", "checkout-1", charge)]);
    expect(charge).toHaveBeenCalledTimes(1);
  });

  it("does not cache failed attempts", async () => {
    const charge = vi.fn()
      .mockRejectedValueOnce(new Error("gateway timeout"))
      .mockResolvedValueOnce({ paymentId: "pay-2", accountId: "account-1", amount: 10 });
    await expect(chargeOnce("account-1", "checkout-2", charge)).rejects.toThrow("timeout");
    await expect(chargeOnce("account-1", "checkout-2", charge)).resolves.toMatchObject({ paymentId: "pay-2" });
  });
});
