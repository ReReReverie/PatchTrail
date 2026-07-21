export interface PaymentWorker {
  charge(): Promise<{ paymentId: string }>;
}

export async function retryFailedCharge(worker: PaymentWorker): Promise<{ paymentId: string }> {
  return worker.charge();
}
