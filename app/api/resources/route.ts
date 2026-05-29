import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/getUser";
import { generateJSON } from "@/lib/ai/gemini";
import { z } from "zod";

const schema = z.object({
  tags: z.array(z.string()),
  title: z.string(),
});

interface ResourceLink {
  type: "youtube" | "article";
  query: string;
  label: string;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { tags, title } = parsed.data;

  try {
    const links = await generateJSON<ResourceLink[]>(
      `Problem: "${title}" | Topics: ${tags.join(", ")}

Suggest exactly 3 YouTube search queries and 2 article/blog search queries that would help someone deeply understand the algorithm used in this problem.

Return a JSON array of objects with exactly these fields:
- type: "youtube" or "article"
- query: the search query string (optimized for YouTube or Google search)
- label: a short human-readable title for this resource (max 8 words)

Example format: [{"type":"youtube","query":"two pointer technique arrays tutorial","label":"Two Pointer Technique Tutorial"}]`,
      "You are a DSA learning resource curator. Return ONLY a valid JSON array, no markdown."
    );
    return NextResponse.json({ links });
  } catch {
    return NextResponse.json({ links: [] });
  }
}
