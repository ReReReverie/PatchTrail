export interface Profile {
  id: string;
  displayName: string;
}

export async function loadProfile(
  id: string,
  request: (url: string) => Promise<Response>,
): Promise<Profile | null> {
  const response = await request(`/api/profiles/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Profile request failed: ${response.status}`);

  const value: unknown = await response.json();
  if (!value || typeof value !== "object" || typeof (value as { id?: unknown }).id !== "string" || typeof (value as { displayName?: unknown }).displayName !== "string") {
    throw new Error("Profile response was malformed");
  }
  return value as Profile;
}
