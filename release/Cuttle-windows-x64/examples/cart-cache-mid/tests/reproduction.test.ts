import { describe, expect, it, vi } from "vitest";
import { clearCartCache, getCart } from "../cart-cache-mid";

describe("cart cache baseline reproductions", () => {
  it("shares a user's US cart with the EU storefront", async () => {
    clearCartCache();
    const load = vi.fn(async (userId: string, region: "us" | "eu") => ({ userId, region, itemIds: [region] }));
    await getCart("user-1", "us", load);
    const euCart = await getCart("user-1", "eu", load);
    expect(euCart.region).toBe("us");
    expect(load).toHaveBeenCalledTimes(1);
  });
});