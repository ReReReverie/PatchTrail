export function ledgerKey(accountId: string, idempotencyKey: string): string {
  return `${accountId}:${idempotencyKey}`;
}
