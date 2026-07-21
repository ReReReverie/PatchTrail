export interface LedgerEntry {
  accountId: string;
  idempotencyKey: string;
  status: "pending" | "completed" | "failed";
}

export function ledgerKey(accountId: string, idempotencyKey: string): string {
  return `${accountId}:${idempotencyKey}`;
}
