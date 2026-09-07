import { prisma } from "@/lib/prisma";

async function extractTextFromFile(fileUrl: string): Promise<string> {
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error("Could not download submission file");
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = fileUrl.split("?")[0].split(".").pop()?.toLowerCase() || "";

  if (ext === "pdf") {
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf-8");
}

export async function runAiReviewForSubmission(submissionId: string, challengeTitle: string, fileUrl: string) {
  const extractedText = await extractTextFromFile(fileUrl);

  if (!extractedText || extractedText.trim().length < 20) {
    throw new Error("Could not extract enough text from this file to review");
  }

  const truncatedText = extractedText.slice(0, 12000);

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are an impartial judge evaluating a student's competition submission. Respond ONLY with valid JSON in the exact form: {\"score\": <integer 0-100>, \"feedback\": \"<2-4 sentence feedback>\"}. No other text before or after the JSON.",
        },
        {
          role: "user",
          content: `Challenge: "${challengeTitle}"\n\nSubmission content:\n${truncatedText}\n\nScore this submission out of 100 based on clarity, completeness, and quality of work, then give short constructive feedback.`,
        },
      ],
      temperature: 0.3,
    }),
  });

  if (!groqRes.ok) {
    const errText = await groqRes.text();
    console.error("Groq API failed:", groqRes.status, errText);
    throw new Error("AI scoring service failed");
  }

  const groqData = await groqRes.json();
  const raw = groqData?.choices?.[0]?.message?.content || "";

  let parsed: { score: number; feedback: string };
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    console.error("Failed to parse Groq response:", raw);
    throw new Error("AI response could not be parsed");
  }

  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
  const feedback = String(parsed.feedback || "No feedback provided.").slice(0, 1000);

  const aiReview = await prisma.aiReview.upsert({
    where: { submissionId },
    create: { submissionId, score, feedback },
    update: { score, feedback },
  });

  return { score: aiReview.score, feedback: aiReview.feedback };
}

export async function checkOrganizerAiAccess(userId: string) {
  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId },
    include: { subscription: true },
  });
  if (!organizerProfile) return { allowed: false, organizerProfile: null };

  const aiReviewFlag = await prisma.featureFlag.findUnique({ where: { key: "AI_REVIEW" } });
  const hasActiveSubscription =
    organizerProfile.subscription?.status === "ACTIVE" &&
    new Date(organizerProfile.subscription.expiresAt) > new Date();

  return { allowed: !!aiReviewFlag?.enabled && hasActiveSubscription, organizerProfile };
}