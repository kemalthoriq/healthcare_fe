export type PageMeta = {
  page: number;
  per_page: number;
  total: number;
};

export type Paginated<T> = {
  data: T[];
  meta: PageMeta;
};

type ErrorBody = {
  error?: {
    code?: string;
    message?: string;
    fields?: Record<string, string>;
  };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

const NETWORK_MESSAGE = "Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.";
const UNKNOWN_MESSAGE = "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function baseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  const url = process.env.API_URL;
  if (!url) {
    throw new Error("API_URL is not set");
  }
  return url.replace(/\/+$/, "");
}

async function request<T>(path: string, { body, headers, ...init }: RequestOptions = {}): Promise<T> {
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}/api/v1${path}`, {
      ...init,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", NETWORK_MESSAGE);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const payload: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (payload as ErrorBody | null)?.error;
    throw new ApiError(
      res.status,
      err?.code ?? "UNKNOWN_ERROR",
      err?.message ?? UNKNOWN_MESSAGE,
      err?.fields ?? {},
    );
  }

  return payload as T;
}

async function data<T>(path: string, options?: RequestOptions): Promise<T> {
  const res = await request<{ data: T } | undefined>(path, options);
  return res?.data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => data<T>(path, { ...options, method: "GET" }),
  list: <T>(path: string, options?: RequestOptions) =>
    request<Paginated<T>>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    data<T>(path, { ...options, method: "POST", body: body ?? {} }),
  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    data<T>(path, { ...options, method: "PUT", body }),
  delete: <T = void>(path: string, options?: RequestOptions) =>
    data<T>(path, { ...options, method: "DELETE" }),
};

export function isApiError(err: unknown, code?: string): err is ApiError {
  return err instanceof ApiError && (code === undefined || err.code === code);
}
