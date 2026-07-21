export interface Cart {
  userId: string;
  region: "us" | "eu";
  itemIds: string[];
}

export interface CacheOptions {
  clock: () => number;
  ttlMs: number;
}

const cartCache = new Map<string, { cart: Cart; expiresAt: number }>();
const defaultOptions: CacheOptions = { clock: () => 0, ttlMs: Number.POSITIVE_INFINITY };

export async function getCart(
  userId: string,
  region: Cart["region"],
  load: (userId: string, region: Cart["region"]) => Promise<Cart>,
  options: CacheOptions = defaultOptions,
): Promise<Cart> {
  // BUG: the cache key ignores region and can return another storefront's cart.
  const cached = cartCache.get(userId);
  if (cached && cached.expiresAt > options.clock()) return cached.cart;

  const cart = await load(userId, region);
  cartCache.set(userId, { cart, expiresAt: options.clock() + options.ttlMs });
  return cart;
}

export function invalidateCartCache(userId: string, _region: Cart["region"]): void {
  cartCache.delete(userId);
}

export function clearCartCache(): void {
  cartCache.clear();
}