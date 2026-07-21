import { describe, expect, it } from "vitest";
import { toggleTodo } from "../fixed/task-list-student";
import { applyEvent } from "../fixed/task-store";

describe("task-list fixed reference", () => {
  it("toggles known tasks and ignores stale actions", () => {
    const todos = [{ id: "todo-1", title: "Read", completed: false }];
    expect(toggleTodo(todos, "todo-1")[0].completed).toBe(true);
    expect(toggleTodo(todos, "missing-id")).toEqual(todos);
  });

  it("ignores duplicate events while preserving order", () => {
    const first = { type: "completed" as const, id: "todo-1", sequence: 2 };
    const second = { type: "deleted" as const, id: "todo-2", sequence: 1 };
    expect(applyEvent(applyEvent([], first), first)).toEqual([first]);
    expect(applyEvent([first], second)).toEqual([second, first]);
  });
});
