import { jwtVerify } from "jose";

export async function verifyBearerToken(
  authHeader: string | null
): Promise<{ id: string; email: string; _debugError?: string } | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "fallback-secret");
  
  try {
    const { payload } = await jwtVerify(token, secret);
    const id = payload.id as string | undefined;
    const email = payload.email as string | undefined;
    if (!id || !email) return { id: "", email: "", _debugError: "Missing id or email" };
    return { id, email };
  } catch (error: any) {
    console.error("JWT Verify Error:", error);
    return { id: "", email: "", _debugError: error?.message || "Verification failed" };
  }
}
