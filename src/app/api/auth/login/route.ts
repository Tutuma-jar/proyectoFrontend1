import { NextRequest, NextResponse } from "next/server";
import { BACKEND_API_URL } from "@/lib/server";
import { COOKIE, HOME, decodeToken } from "@/lib/session";

// Inicia sesion: pide el token al backend y lo guarda en una cookie httpOnly
export async function POST(request: NextRequest) {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "No se pudo conectar con el servidor" }, { status: 502 });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.accessToken) {
    return NextResponse.json({ message: data?.message ?? "No se pudo iniciar sesion" }, { status: res.status });
  }

  const session = decodeToken(data.accessToken);
  if (!session) return NextResponse.json({ message: "Token invalido" }, { status: 502 });

  const response = NextResponse.json({ role: session.role, home: HOME[session.role] });
  response.cookies.set(COOKIE, data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    expires: new Date(session.exp * 1000),
  });
  return response;
}
