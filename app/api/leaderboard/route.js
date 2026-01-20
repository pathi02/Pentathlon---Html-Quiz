import { promises as fs } from "fs";
import path from "path";

const submissionsFile = path.resolve(process.cwd(), "data", "submissions.json");

async function readSubmissions() {
  try {
    const raw = await fs.readFile(submissionsFile, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export async function GET(request) {
  const adminKey = process.env.ADMIN_KEY;
  const adminDev = process.env.ADMIN_DEV === "true";
  if (!adminKey && !adminDev) {
    return Response.json(
      { error: "Server admin key not configured" },
      { status: 500 },
    );
  }
  const provided = request.headers.get("x-admin-key") || "";
  if (!adminDev && provided !== adminKey) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const submissions = await readSubmissions();

    // Compute best score per token (player)
    const bestByToken = {};
    for (const s of submissions) {
      const t = s.token;
      if (
        !bestByToken[t] ||
        s.score > bestByToken[t].score ||
        (s.score === bestByToken[t].score &&
          s.timestamp > bestByToken[t].timestamp)
      ) {
        bestByToken[t] = {
          token: t,
          participantName: s.participantName || null,
          score: s.score,
          timestamp: s.timestamp,
        };
      }
    }

    const leaderboard = Object.values(bestByToken).sort(
      (a, b) => b.score - a.score || a.timestamp - b.timestamp,
    );

    return Response.json({ leaderboard });
  } catch (err) {
    return Response.json(
      { error: "Unable to build leaderboard" },
      { status: 500 },
    );
  }
}
