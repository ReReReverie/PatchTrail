export function createProfileCache<T>() {
  const values = new Map<string, T>();
  return {
    get: (id: string) => values.get(id),
    set: (id: string, value: T) => values.set(id, value),
    clear: (id: string) => values.delete(id),
  };
}
