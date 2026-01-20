import { promises as fs } from 'fs';
import path from 'path';
import { clearQuizCache } from '@/lib/quiz';

const quizFile = path.resolve(process.cwd(), 'data', 'quiz.json');

async function readQuiz() {
    try {
        await fs.mkdir(path.dirname(quizFile), { recursive: true });
        const raw = await fs.readFile(quizFile, 'utf-8');
        return JSON.parse(raw);
    } catch (err) {
        return null;
    }
}

async function writeQuiz(quizData) {
    await fs.mkdir(path.dirname(quizFile), { recursive: true });
    await fs.writeFile(quizFile, JSON.stringify(quizData, null, 2), 'utf-8');
}

export async function GET(request) {
    try {
        const quiz = await readQuiz();
        return Response.json({ quiz });
    } catch (error) {
        return Response.json(
            { error: 'Failed to fetch quiz' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        // In production, verify admin token here
        const body = await request.json();
        const { quiz } = body;

        // Validate quiz structure
        if (!quiz || !quiz.htmlTemplate || !Array.isArray(quiz.blanks)) {
            return Response.json(
                { error: 'Invalid quiz data' },
                { status: 400 }
            );
        }

        // Ensure durationSeconds is set
        if (!quiz.durationSeconds) {
            quiz.durationSeconds = 1800;
        }

        await writeQuiz(quiz);
        
        // Clear the quiz cache so changes take effect immediately
        clearQuizCache();

        return Response.json({ success: true, message: 'Quiz updated successfully' });
    } catch (error) {
        return Response.json(
            { error: 'Failed to update quiz' },
            { status: 500 }
        );
    }
}
