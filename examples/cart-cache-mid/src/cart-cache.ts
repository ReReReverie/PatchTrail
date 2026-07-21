import type { Region, StorefrontCart } from "./storefront";

export function createCartCache() {
  const values = new Map<string, StorefrontCart>();
  return {
    get: (userId: string, region: Region) => values.get(userId),
    set: (cart: StorefrontCart) => values.set(`${cart.userId}:${cart.region}`, cart),
    clear: () => values.clear(),
  };
}
