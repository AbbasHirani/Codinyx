import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});

export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  const parts = systemPrompt
    ? [{ text: `${systemPrompt}\n\n${prompt}` }]
    : [{ text: prompt }];

  const result = await geminiModel.generateContent({ contents: [{ role: "user", parts }] });
  return result.response.text();
}

export async function generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
  const fullPrompt = systemPrompt
    ? `${systemPrompt}\n\nIMPORTANT: Return ONLY valid JSON with no markdown, no code blocks, no explanation.\n\n${prompt}`
    : `${prompt}\n\nIMPORTANT: Return ONLY valid JSON with no markdown, no code blocks, no explanation.`;

  const result = await geminiModel.generateContent({
    contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
  });

  const text = result.response.text().trim();
  const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(cleaned) as T;
}
