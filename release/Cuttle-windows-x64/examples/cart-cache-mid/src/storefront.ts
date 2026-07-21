export type Region = "us" | "eu";

export interface StorefrontCart {
  userId: string;
  region: Region;
  itemIds: string[];
}

export function storefrontKey(userId: string, region: Region): string {
  return `${userId}:${region}`;
}
