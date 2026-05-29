import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";
import { SignJWT } from "jose";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "fallback-secret");

export async function POST(req: NextRequest) {
  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user?.password) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const valid = await compare(parsed.data.password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await new SignJWT({ id: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  return NextResponse.json({ token });
}
