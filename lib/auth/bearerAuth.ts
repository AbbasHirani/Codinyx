import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "fallback-secret");

export async function verifyBearerToken(
  authHeader: string | null
): Promise<{ id: string; email: string } | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, secret);
    const id = payload.id as string | undefined;
    const email = payload.email as string | undefined;
    if (!id || !email) return null;
    return { id, email };
  } catch {
    return null;
  }
}
