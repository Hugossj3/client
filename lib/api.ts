const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body == null ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 204) {
    return null as T;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? `Error ${response.status}`);
  }
  return data as T;
}

export { API_URL };
