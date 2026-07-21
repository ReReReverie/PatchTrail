export interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

export function toggleTodo(todos: Todo[], id: string): Todo[] {
  return todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
}
