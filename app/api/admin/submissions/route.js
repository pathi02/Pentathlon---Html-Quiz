import { promises as fs } from 'fs';
import path from 'path';

const submissionsFile = path.resolve(process.cwd(), 'data', 'submissions.json');

async function readSubmissions() {
    try {
        await fs.mkdir(path.dirname(submissionsFile), { recursive: true });
        const raw = await fs.readFile(submissionsFile, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        return [];
    }
}

export async function GET(request) {
    try {
        // In production, verify admin token here
        const submissions = await readSubmissions();
        
        // Sort by score (highest first), then by timestamp
        const sorted = submissions.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.timestamp - b.timestamp;
        });

        // Calculate statistics
        const total = submissions.length;
        const avgScore = total > 0 
            ? Math.round(submissions.reduce((sum, s) => sum + s.score, 0) / total)
            : 0;
        const maxScore = submissions.length > 0
            ? Math.max(...submissions.map(s => s.score))
            : 0;

        return Response.json({
            submissions: sorted,
            statistics: {
                total,
                averageScore: avgScore,
                maxScore
            }
        });
    } catch (error) {
        return Response.json(
            { error: 'Failed to fetch submissions' },
            { status: 500 }
        );
    }
}

