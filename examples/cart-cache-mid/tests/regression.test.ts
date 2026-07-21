import { describe, expect, it } from "vitest";
import { clearCartCache, getCart } from "../cart-cache-mid";

describe("cart cache learner regression suite", () => {
  it("keeps US and EU carts independent", async () => {
    clearCartCache();
    const load = async (userId: string, region: "us" | "eu") => ({ userId, region, itemIds: [region] });
    expect((await getCart("user-1", "us", load)).region).toBe("us");
    expect((await getCart("user-1", "eu", load)).region).toBe("eu");
  });
});