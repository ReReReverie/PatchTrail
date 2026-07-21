import { describe, expect, it, vi } from "vitest";
import { clearCartCache, getCart, invalidateCartCache } from "../fixed/cart-cache-mid";

describe("cart cache fixed reference", () => {
  it("isolates regions, reuses same-region hits, and expires by injected time", async () => {
    clearCartCache();
    let now = 0;
    const options = { clock: () => now, ttlMs: 1_000 };
    const load = vi.fn(async (userId: string, region: "us" | "eu") => ({ userId, region, itemIds: [region] }));
    const us = await getCart("user-1", "us", load, options);
    const eu = await getCart("user-1", "eu", load, options);
    expect(us.region).toBe("us");
    expect(eu.region).toBe("eu");
    expect(await getCart("user-1", "us", load, options)).toBe(us);
    now = 1_001;
    expect(await getCart("user-1", "us", load, options)).not.toBe(us);
    expect(load).toHaveBeenCalledTimes(3);
  });

  it("deduplicates concurrent loads and does not cache failures", async () => {
    clearCartCache();
    let resolve!: (value: { userId: string; region: "us"; itemIds: string[] }) => void;
    const load = vi.fn(() => new Promise<{ userId: string; region: "us"; itemIds: string[] }>((next) => { resolve = next; }));
    const first = getCart("user-1", "us", load);
    const second = getCart("user-1", "us", load);
    resolve({ userId: "user-1", region: "us", itemIds: ["sku-1"] });
    expect(await first).toBe(await second);
    expect(load).toHaveBeenCalledTimes(1);

    clearCartCache();
    const failed = vi.fn()
      .mockRejectedValueOnce(new Error("storefront unavailable"))
      .mockResolvedValueOnce({ userId: "user-1", region: "us" as const, itemIds: ["sku-2"] });
    await expect(getCart("user-1", "us", failed)).rejects.toThrow("unavailable");
    await expect(getCart("user-1", "us", failed)).resolves.toMatchObject({ itemIds: ["sku-2"] });
  });

  it("invalidates one regional entry without evicting the other", async () => {
    clearCartCache();
    const load = vi.fn(async (userId: string, region: "us" | "eu") => ({ userId, region, itemIds: [region] }));
    const us = await getCart("user-1", "us", load);
    const eu = await getCart("user-1", "eu", load);
    invalidateCartCache("user-1", "us");
    expect(await getCart("user-1", "eu", load)).toBe(eu);
    expect(await getCart("user-1", "us", load)).not.toBe(us);
    expect(load).toHaveBeenCalledTimes(3);
  });
});