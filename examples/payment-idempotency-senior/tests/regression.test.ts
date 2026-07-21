import { afterEach, describe, expect, it } from "vitest";
import { chargeOnce, clearCompletedPayments } from "../payment-idempotency-senior";

describe("payment learner regression suite", () => {
  afterEach(() => clearCompletedPayments());

  it("does not share a key across accounts", async () => {
    const charge = async () => ({ paymentId: "pay-1", accountId: "account-1", amount: 10 });
    await chargeOnce("account-1", "checkout-1", charge);
    const second = await chargeOnce("account-2", "checkout-1", async () => ({ paymentId: "pay-2", accountId: "account-2", amount: 10 }));
    expect(second.accountId).toBe("account-2");
  });
});
