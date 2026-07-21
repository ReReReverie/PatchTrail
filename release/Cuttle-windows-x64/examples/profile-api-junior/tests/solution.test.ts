import { describe, expect, it } from "vitest";
import { loadProfile } from "../fixed/profile-api-junior";
import { createProfileCache } from "../fixed/profile-cache";

describe("profile API fixed reference", () => {
  it("distinguishes valid, deleted, failed, and malformed responses", async () => {
    await expect(loadProfile("user-1", async () => Response.json({ id: "user-1", displayName: "Ari" })))
      .resolves.toEqual({ id: "user-1", displayName: "Ari" });
    await expect(loadProfile("deleted-user", async () => Response.json({ message: "Not found" }, { status: 404 })))
      .resolves.toBeNull();
    await expect(loadProfile("user-1", async () => Response.json({ message: "down" }, { status: 500 })))
      .rejects.toThrow("500");
    await expect(loadProfile("user-1", async () => Response.json({ id: "user-1" })))
      .rejects.toThrow("malformed");
  });

  it("supports explicit cache invalidation", () => {
    const cache = createProfileCache<{ id: string }>();
    cache.set("user-1", { id: "user-1" });
    cache.clear("user-1");
    expect(cache.get("user-1")).toBeUndefined();
  });
});
