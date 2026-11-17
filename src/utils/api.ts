/** Cliente HTTP da API Pratello (o Vite redireciona /api para o servidor Express). */

let token: string | null = null;

export const setApiToken = (t: string | null) => {
  token = t;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export const OFFLINE_MESSAGE = 'Sem conexão com o servidor. Verifique se a API está rodando (npm run dev).';

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(OFFLINE_MESSAGE, 0);
  }
  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) {
    // proxy do Vite responde 500/502/504 sem JSON quando a API está fora do ar
    if (!data && res.status >= 500) throw new ApiError(OFFLINE_MESSAGE, 0);
    throw new ApiError(data?.error ?? `Erro ${res.status}`, res.status);
  }
  return data as T;
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Erro inesperado.');
