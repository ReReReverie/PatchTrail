export interface Cart {
  userId: string;
  region: "us" | "eu";
  itemIds: string[];
}

export interface CacheOptions {
  clock: () => number;
  ttlMs: number;
}

const cartCache = new Map<string, Cart>();
const loadedAtByKey = new Map<string, number>();
const pending = new Map<string, Promise<Cart>>();
const defaultOptions: CacheOptions = { clock: () => 0, ttlMs: Number.POSITIVE_INFINITY };

export async function getCart(
  userId: string,
  region: Cart["region"],
  load: (userId: string, region: Cart["region"]) => Promise<Cart>,
  options: CacheOptions = defaultOptions,
): Promise<Cart> {
  const key = `${userId}:${region}`;
  const cached = cartCache.get(key);
  const loadedAt = loadedAtByKey.get(key);
  if (cached && loadedAt !== undefined && options.clock() - loadedAt < options.ttlMs) return cached;
  if (cached) {
    cartCache.delete(key);
    loadedAtByKey.delete(key);
  }

  const existing = pending.get(key);
  if (existing) return existing;

  const request = load(userId, region)
    .then((cart) => {
      cartCache.set(key, cart);
      loadedAtByKey.set(key, options.clock());
      return cart;
    })
    .finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}

export function invalidateCartCache(userId: string, region: Cart["region"]): void {
  const key = `${userId}:${region}`;
  cartCache.delete(key);
  loadedAtByKey.delete(key);
}

export function clearCartCache(): void {
  cartCache.clear();
  loadedAtByKey.clear();
  pending.clear();
}