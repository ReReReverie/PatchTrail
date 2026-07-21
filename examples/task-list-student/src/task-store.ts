export interface TaskEvent {
  type: "completed" | "deleted";
  id: string;
  sequence: number;
}

export function applyEvent(events: TaskEvent[], next: TaskEvent): TaskEvent[] {
  return [...events, next].sort((left, right) => left.sequence - right.sequence);
}
