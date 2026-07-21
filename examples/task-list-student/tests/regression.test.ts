import { describe, expect, it } from "vitest";
import { toggleTodo } from "../task-list-student";

describe("task-list learner regression suite", () => {
  it("ignores a removed task without mutating the list", () => {
    const todos = [{ id: "todo-1", title: "Read", completed: false }];
    expect(toggleTodo(todos, "missing-id")).toEqual(todos);
  });
});
