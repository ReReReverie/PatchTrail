export interface TaskEvent {
  type: "completed" | "deleted";
  id: string;
  sequence: number;
}

export function applyEvent(events: TaskEvent[], next: TaskEvent): TaskEvent[] {
  if (events.some((event) => event.sequence === next.sequence)) return events;
  return [...events, next].sort((left, right) => left.sequence - right.sequence);
}
