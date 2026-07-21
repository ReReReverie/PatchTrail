import { describe, expect, it } from "vitest";
import { loadProfile } from "../profile-api-junior";

describe("profile API learner regression suite", () => {
  it("returns null for a deleted profile", async () => {
    await expect(loadProfile("deleted-user", async () => Response.json({ message: "Not found" }, { status: 404 })))
      .resolves.toBeNull();
  });
});
