import { describe, expect, it } from "vitest";
import { loadProfile } from "../profile-api-junior";

describe("profile API baseline reproductions", () => {
  it("treats a 404 error payload as a profile", async () => {
    const response = Response.json({ message: "Not found" }, { status: 404 });
    await expect(loadProfile("deleted-user", async () => response)).resolves.toEqual({ message: "Not found" });
  });

  it("treats a server error and malformed success as profiles", async () => {
    await expect(loadProfile("user-1", async () => Response.json({ message: "down" }, { status: 500 })))
      .resolves.toEqual({ message: "down" });
    await expect(loadProfile("user-1", async () => Response.json({ id: "user-1" })))
      .resolves.toEqual({ id: "user-1" });
  });
});