import axios, { type InternalAxiosRequestConfig } from "axios";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export interface Envelope<T> {
  data: T;
  message: string;
  success: boolean;
  statuscode: number;
}
export const api = axios.create({
  baseURL: "/api/backend",
  withCredentials: true,
  timeout: 30000,
});
let refreshPromise: Promise<unknown> | null = null;
type RetryConfig = InternalAxiosRequestConfig & { retried?: boolean };
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError<{ message?: string }>(error))
      return Promise.reject(error);
    const config: RetryConfig | undefined = error.config;
    const status = error.response?.status ?? 0;
    const skip = /\/users\/(login|register|refresh-token)/.test(
      config?.url ?? ""
    );
    if (status === 401 && config && !config.retried && !skip) {
      config.retried = true;
      refreshPromise ??= api.post("/users/refresh-token").finally(() => {
        refreshPromise = null;
      });
      try {
        await refreshPromise;
        return await api(config);
      } catch {
        if (typeof window !== "undefined")
          window.dispatchEvent(new Event("studback:session-expired"));
      }
    }
    return Promise.reject(
      new ApiError(
        error.response?.data?.message ??
          (status === 0
            ? "We couldn’t reach Studback. Check your connection and try again."
            : "Something went wrong. Please try again."),
        status
      )
    );
  }
);
export async function get<T>(
  path: string,
  params?: Record<string, string | number>,
  signal?: AbortSignal
) {
  return (await api.get<Envelope<T>>(path, { params, signal })).data.data;
}
export async function post<T>(path: string, body?: unknown) {
  return (await api.post<Envelope<T>>(path, body)).data.data;
}
export async function patch<T>(path: string, body?: unknown) {
  return (await api.patch<Envelope<T>>(path, body)).data.data;
}
export async function remove(path: string) {
  await api.delete(path);
}
