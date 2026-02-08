import { type Profile } from '@/types/profile';

export async function getProfile(): Promise<Profile> {
  const response = await fetch(`/api/profile`);

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Profile;
}

export async function updateProfile(profile: Profile): Promise<Profile> {
  const response = await fetch(`/api/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw response;
  }

  const json = await response.json();
  return json as Profile;
}
