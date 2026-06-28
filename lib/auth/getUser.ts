import { auth } from "@/auth";
import { verifyBearerToken } from "./bearerAuth";
import { NextRequest } from "next/server";

export async function getUser(
  req: NextRequest
): Promise<{ id: string; email: string; _debugError?: string } | null> {
  // Try Bearer token first (extension uses this)
  const bearer = await verifyBearerToken(req.headers.get("authorization"));
  if (bearer) {
    if (bearer._debugError) return bearer;
    return bearer;
  }

  // Fallback to cookie-based NextAuth session (web app)
  const session = await auth();
  if (session?.user?.id && session.user.email) {
    return { id: session.user.id, email: session.user.email };
  }

  return null;
}
