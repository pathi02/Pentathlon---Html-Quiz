import { gradeAnswers } from "@/lib/quiz";
import { promises as fs } from "fs";
import path from "path";

const submissionsFile = path.resolve(process.cwd(), "data", "submissions.json");
const submittedTokens = new Set();

async function readSubmissions() {
  try {
    const raw = await fs.readFile(submissionsFile, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

async function writeSubmissions(list) {
  await fs.mkdir(path.dirname(submissionsFile), { recursive: true });
  await fs.writeFile(submissionsFile, JSON.stringify(list, null, 2), "utf-8");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, endTime, answers, participantName } = body;

    if (!token) {
      return Response.json({ error: "Missing token" }, { status: 400 });
    }

    // Basic payload validation
    if (!answers || typeof answers !== "object") {
      return Response.json({ error: "Invalid answers" }, { status: 400 });
    }

    const name =
      typeof participantName === "string" && participantName.trim()
        ? participantName.trim()
        : "Anonymous";

    // Load existing submissions and sync in-memory tokens
    const submissions = await readSubmissions();
    for (const s of submissions) submittedTokens.add(s.token);

    // Check if already submitted
    if (submittedTokens.has(token)) {
      return Response.json({ error: "Already submitted" }, { status: 400 });
    }

    // Check if time is up
    const now = Date.now();
    const timeUp = now >= endTime;

    // Grade the answers
    const result = await gradeAnswers(answers || {});

    const entry = {
      token,
      participantName: name,
      timestamp: Date.now(),
      score: result.score,
      timeUp,
      breakdown: result.breakdown,
    };

    submissions.push(entry);
    await writeSubmissions(submissions);

    // Mark as submitted in-memory
    submittedTokens.add(token);

    return Response.json({
      score: result.score,
      timeUp,
      submitted: true,
      breakdown: result.breakdown,
    });
  } catch (error) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}

