import { gradeAnswers } from "@/lib/quiz";

// In-memory storage for submitted tokens
const submittedTokens = new Set();

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, endTime, answers, participantName } = body;

    if (!token) {
      return Response.json({ error: "Missing token" }, { status: 400 });
    }

    if (!answers || typeof answers !== "object") {
      return Response.json({ error: "Invalid answers" }, { status: 400 });
    }

    // Check if time is up
    const now = Date.now();
    const timeUp = now >= endTime;

    // Grade the answers
    const result = await gradeAnswers(answers || {});

    return Response.json({
      score: result.score,
      timeUp,
      submitted: false,
      breakdown: result.breakdown,
    });
  } catch (error) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

