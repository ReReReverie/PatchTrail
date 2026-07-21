import { describe, expect, it } from "vitest";
import { toggleTodo } from "../task-list-student";
import { applyEvent } from "../src/task-store";

describe("task-list baseline reproductions", () => {
  it("throws when a stale toggle references a removed task", () => {
    expect(() => toggleTodo([{ id: "todo-1", title: "Read", completed: false }], "missing-id"))
      .toThrow();
  });

  it("duplicates an already-applied sync event", () => {
    const event = { type: "completed" as const, id: "todo-1", sequence: 4 };
    expect(applyEvent([event], event)).toHaveLength(2);
  });
});
