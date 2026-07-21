export interface HttpResponse {
  status: number;
  json(): Promise<unknown>;
}

export async function requestProfile(
  id: string,
  request: (url: string) => Promise<HttpResponse>,
): Promise<unknown> {
  const response = await request(`/api/profiles/${id}`);
  return response.json();
}
