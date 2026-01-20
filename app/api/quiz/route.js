import { getQuiz } from '@/lib/quiz';

export async function GET(request) {
    try {
        const quiz = await getQuiz();
        
        // Return only public info (no answers)
        const publicQuiz = {
            durationSeconds: quiz.durationSeconds,
            htmlTemplate: quiz.htmlTemplate,
            blanks: quiz.blanks.map(blank => ({
                id: blank.id,
                points: blank.points
                // Intentionally exclude: expected, acceptedAnswers, trim, caseSensitive
            }))
        };
        
        return Response.json(publicQuiz);
    } catch (error) {
        return Response.json(
            { error: 'Failed to fetch quiz' },
            { status: 500 }
        );
    }
}

