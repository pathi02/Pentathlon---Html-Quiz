// Quiz configuration - SERVER-SIDE ONLY
// This file should never be imported by client components

import { promises as fs } from "fs";
import path from "path";

const quizFile = path.resolve(process.cwd(), "data", "quiz.json");

let _cachedQuiz = null;

// Function to clear cache (for admin updates)
export function clearQuizCache() {
  _cachedQuiz = null;
}

async function loadQuiz() {
  // Always reload from file for admin updates
  // if (_cachedQuiz) return _cachedQuiz;
  try {
    const raw = await fs.readFile(quizFile, "utf-8");
    _cachedQuiz = JSON.parse(raw);
    return _cachedQuiz;
  } catch (err) {
    // Fallback to embedded defaults
    return {
      durationSeconds: 1800,
      htmlTemplate: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Page</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    
    <__BLANK_1__>This is a paragraph about web development.</__BLANK_1__>
    
    <__BLANK_2__>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
    </__BLANK_2__>
    
    <__BLANK_3__>
        <li>Apple</li>
        <li>Banana</li>
        <li>Cherry</li>
    </__BLANK_3__>
    
    <__BLANK_4__>
    
    <p>Visit our <__BLANK_5__ href="https://example.com">homepage</__BLANK_5__> for more information.</p>
    
    <__BLANK_6__ src="logo.png" alt="Company Logo" />
    
    <footer>
        <p>Copyright &copy; 2024</p>
    </footer>
</body>
</html>`,
      blanks: [
        {
          id: "BLANK_1",
          expected: "p",
          points: 20,
          trim: true,
          caseSensitive: false,
          acceptedAnswers: ["p", "P"],
        },
        {
          id: "BLANK_2",
          expected: "ol",
          points: 15,
          trim: true,
          caseSensitive: false,
          acceptedAnswers: ["ol", "OL", "orderedlist"],
        },
        {
          id: "BLANK_3",
          expected: "ul",
          points: 15,
          trim: true,
          caseSensitive: false,
        },
        {
          id: "BLANK_4",
          expected: "hr",
          points: 10,
          trim: true,
          caseSensitive: false,
        },
        {
          id: "BLANK_5",
          expected: "a",
          points: 20,
          trim: true,
          caseSensitive: false,
        },
        {
          id: "BLANK_6",
          expected: "img",
          points: 20,
          trim: true,
          caseSensitive: false,
        },
      ],
    };
  }
}

export async function getQuiz() {
  return await loadQuiz();
}

export async function getBlanks() {
  const q = await loadQuiz();
  return q.blanks || [];
}

export async function getHtmlTemplate() {
  const q = await loadQuiz();
  return q.htmlTemplate || "";
}

// Helper function to grade a single blank
export function gradeBlank(blank, answer) {
  let processedAnswer = answer;

  if (blank.trim) {
    processedAnswer = processedAnswer.trim();
  }

  if (!blank.caseSensitive) {
    processedAnswer = processedAnswer.toLowerCase();
  }

  const expected = blank.caseSensitive
    ? blank.expected
    : blank.expected.toLowerCase();

  // Check if answer matches expected
  if (processedAnswer === expected) {
    return { correct: true, earned: blank.points, possible: blank.points };
  }

  // Check accepted answers if provided
  if (blank.acceptedAnswers && blank.acceptedAnswers.length > 0) {
    const normalizedAccepted = blank.acceptedAnswers.map((a) =>
      blank.caseSensitive ? a : a.toLowerCase(),
    );
    if (normalizedAccepted.includes(processedAnswer)) {
      return { correct: true, earned: blank.points, possible: blank.points };
    }
  }

  return { correct: false, earned: 0, possible: blank.points };
}

// Grade all answers
export async function gradeAnswers(answers) {
  const blanksList = await getBlanks();
  const breakdown = {};
  let totalScore = 0;

  for (const blank of blanksList) {
    const answer = answers[blank.id] || "";
    const result = gradeBlank(blank, answer);
    breakdown[blank.id] = {
      ...result,
      given: answer,
    };
    totalScore += result.earned;
  }

  return {
    score: totalScore,
    breakdown,
  };
}

