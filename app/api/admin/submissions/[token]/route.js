import { promises as fs } from "fs";
import path from "path";

const submissionsFile = path.resolve(process.cwd(), "data", "submissions.json");

async function readSubmissions() {
  try {
    await fs.mkdir(path.dirname(submissionsFile), { recursive: true });
    const raw = await fs.readFile(submissionsFile, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

async function writeSubmissions(submissions) {
  await fs.mkdir(path.dirname(submissionsFile), { recursive: true });
  await fs.writeFile(
    submissionsFile,
    JSON.stringify(submissions, null, 2),
    "utf-8",
  );
}

export async function DELETE(request, { params }) {
  try {
    const { token } = params;

    // Check authorization
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submissions = await readSubmissions();
    const filtered = submissions.filter((s) => s.token !== token);

    if (filtered.length === submissions.length) {
      return Response.json({ error: "Submission not found" }, { status: 404 });
    }

    await writeSubmissions(filtered);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: "Failed to delete submission" },
      { status: 500 },
    );
  }
}
