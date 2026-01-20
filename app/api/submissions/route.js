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
    return Response.json({ submissions });
  } catch (err) {
    return Response.json(
      { error: "Unable to read submissions" },
      { status: 500 },
    );
  }
}
