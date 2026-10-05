// Utilidades SOLO para el servidor (paginas y layouts): leer la sesion y llamar a la API con el token.
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, decodeToken, type Session } from "./session";

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return decodeToken(jar.get(COOKIE)?.value);
}

// Exige sesion; si no hay, manda al login
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

// Llama a la API del backend con el token de la cookie. Si el token ya no sirve (401), vuelve al login
export async function apiGet<T>(path: string): Promise<T> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
  } catch {
    throw new ApiError(502, "No se pudo conectar con el servidor");
  }
  if (res.status === 401) redirect("/login?expired=1");
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(". ") : (body?.message ?? "Error inesperado");
    throw new ApiError(res.status, message);
  }
  return body as T;
}

// Igual que apiGet pero devuelve null si falla (para datos "de adorno" que no deben tumbar la pagina)
export async function apiGetOrNull<T>(path: string): Promise<T | null> {
  try {
    return await apiGet<T>(path);
  } catch (error) {
    if (error instanceof ApiError) return null;
    throw error;
  }
}
