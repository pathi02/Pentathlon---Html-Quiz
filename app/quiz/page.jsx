"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import styles from "./page.module.css";

// Dynamically import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState({});
  const [htmlContent, setHtmlContent] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
  const [endTime, setEndTime] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [checkResults, setCheckResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);
  const tokenRef = useRef(null);
  const endTimeRef = useRef(null);
  const [blanks, setBlanks] = useState([]);
  const [htmlTemplate, setHtmlTemplate] = useState("");
  const [duration, setDuration] = useState(1800);
  const [quizLoading, setQuizLoading] = useState(true);

  const isLockedRef = useRef(false);
  const answersRef = useRef({});

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Load quiz configuration
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await fetch("/api/quiz");
        const data = await response.json();
        if (data.htmlTemplate && data.blanks) {
          setHtmlTemplate(data.htmlTemplate);
          setBlanks(data.blanks);
          setDuration(data.durationSeconds || 1800);
          setHtmlContent(data.htmlTemplate);
        }
      } catch (error) {
        console.error("Failed to load quiz:", error);
      } finally {
        setQuizLoading(false);
      }
    };

    loadQuiz();
  }, []);

  const handleSubmit = async () => {
    if (!tokenRef.current || !endTimeRef.current || isLocked) {
      console.log("Submit blocked:", {
        token: !!tokenRef.current,
        endTime: !!endTimeRef.current,
        isLocked,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const participantName = localStorage.getItem("participantName") || null;
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenRef.current,
          endTime: endTimeRef.current,
          participantName,
          answers: answersRef.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Submit error:", errorData);
        alert(errorData.error || "Submit failed");
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();
      setFinalResults(data);
      setIsLocked(true);
      isLockedRef.current = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (isLockedRef.current) return;
    await handleSubmit();
  };

  useEffect(() => {
    if (quizLoading || !htmlTemplate || !blanks.length) return;

    // Check if token exists and quiz was started; otherwise redirect to home
    const token = localStorage.getItem("quizToken");
    const started = localStorage.getItem("quizStarted") === "1";
    if (!token || !started) {
      // Not started (or no token) — go back to start page
      router.push("/");
      return;
    }
    tokenRef.current = token;

    // Get or set end time
    const storedEndTime = localStorage.getItem("quizEndTime");
    let end;
    if (storedEndTime) {
      end = parseInt(storedEndTime, 10);
      // Validate stored time is in the future
      if (end <= Date.now()) {
        end = Date.now() + duration * 1000;
        localStorage.setItem("quizEndTime", end.toString());
      }
    } else {
      end = Date.now() + duration * 1000; // Use loaded duration
      localStorage.setItem("quizEndTime", end.toString());
    }
    setEndTime(end);
    endTimeRef.current = end;

    // Update time remaining function
    const updateTime = () => {
      if (!endTimeRef.current) return;
      const now = Date.now();
      let remaining = Math.floor((endTimeRef.current - now) / 1000);

      if (remaining <= 0) {
        remaining = 0;
        setTimeRemaining(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // Auto-submit when time runs out
        if (!isLockedRef.current) {
          handleAutoSubmit();
        }
        return;
      }

      setTimeRemaining(remaining);
    };

    // Initial time update
    updateTime();

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start timer
    timerRef.current = setInterval(updateTime, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, quizLoading, htmlTemplate, duration, blanks.length]);

  const updateAnswer = (blankId, value) => {
    if (isLocked) return;

    const newAnswers = { ...answers, [blankId]: value };
    setAnswers(newAnswers);

    // Update HTML content
    let updatedHtml = htmlTemplate;
    for (const blank of blanks) {
      const placeholder = `__${blank.id}__`;
      const answer = newAnswers[blank.id] || placeholder;
      updatedHtml = updatedHtml.replace(new RegExp(placeholder, "g"), answer);
    }
    setHtmlContent(updatedHtml);
  };

  const handleCheck = async () => {
    if (!tokenRef.current || !endTimeRef.current || isLocked) {
      console.log("Check blocked:", {
        token: !!tokenRef.current,
        endTime: !!endTimeRef.current,
        isLocked,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const participantName = localStorage.getItem("participantName") || null;
      const response = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenRef.current,
          endTime: endTimeRef.current,
          participantName,
          answers: answersRef.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Check error:", errorData);
        alert(errorData.error || "Check failed");
        return;
      }

      const data = await response.json();
      setCheckResults(data);
    } catch (error) {
      console.error("Check failed:", error);
      alert("Failed to check answers. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getBlankStatus = (blankId) => {
    if (finalResults?.breakdown?.[blankId]) {
      return finalResults.breakdown[blankId].correct ? "correct" : "incorrect";
    }
    if (checkResults?.breakdown?.[blankId]) {
      return checkResults.breakdown[blankId].correct ? "correct" : "incorrect";
    }
    return "neutral";
  };

  if (quizLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading quiz...</div>
      </div>
    );
  }

  if (finalResults) {
    return (
      <div className={styles.container}>
        <div className={styles.resultsCard}>
          <h1 className={styles.resultsTitle}>Quiz Results</h1>
          <div className={styles.scoreDisplay}>
            <div className={styles.totalScore}>
              Total Score: {finalResults.score} /{" "}
              {blanks.reduce((sum, b) => sum + b.points, 0)}
            </div>
          </div>

          <div className={styles.breakdown}>
            <h2>Breakdown</h2>
            <table className={styles.resultsTable}>
              <thead>
                <tr>
                  <th>Blank ID</th>
                  <th>Your Answer</th>
                  <th>Status</th>
                  <th>Points Earned</th>
                  <th>Points Possible</th>
                </tr>
              </thead>
              <tbody>
                {blanks.map((blank) => {
                  const result = finalResults.breakdown[blank.id];
                  return (
                    <tr key={blank.id}>
                      <td>{blank.id}</td>
                      <td>{result?.given || "(empty)"}</td>
                      <td>
                        <span
                          className={
                            result?.correct
                              ? styles.correctBadge
                              : styles.incorrectBadge
                          }
                        >
                          {result?.correct ? "✓ Correct" : "✗ Incorrect"}
                        </span>
                      </td>
                      <td>{result?.earned || 0}</td>
                      <td>{result?.possible || blank.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("quizToken");
              localStorage.removeItem("quizEndTime");
              localStorage.removeItem("participantName");
              localStorage.removeItem("quizStarted");
              router.push("/");
            }}
            className={styles.restartButton}
          >
            Restart Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.timer}>
          Time Remaining: {formatTime(timeRemaining)}
        </div>
        <div className={styles.actions}>
          <button
            onClick={handleCheck}
            disabled={isLocked || isSubmitting}
            className={styles.checkButton}
          >
            Check
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLocked || isSubmitting}
            className={styles.submitButton}
          >
            Submit
          </button>
        </div>
      </div>

      <div className={styles.quizLayout}>
        <div className={styles.editorSection}>
          <h3 className={styles.sectionTitle}>HTML Preview</h3>
          <MonacoEditor
            height="600px"
            language="html"
            value={htmlContent}
            theme="vs-light"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        <div className={styles.inputsSection}>
          <h3 className={styles.sectionTitle}>Fill in the Blanks</h3>
          <div className={styles.blanksList}>
            {blanks.map((blank) => {
              const status = getBlankStatus(blank.id);
              return (
                <div key={blank.id} className={styles.blankItem}>
                  <label className={styles.blankLabel}>
                    {blank.id}{" "}
                    <span className={styles.points}>({blank.points} pts)</span>
                  </label>
                  <input
                    type="text"
                    value={answers[blank.id] || ""}
                    onChange={(e) => updateAnswer(blank.id, e.target.value)}
                    disabled={isLocked}
                    className={`${styles.blankInput} ${styles[status]}`}
                    placeholder="Enter your answer"
                  />
                  {checkResults?.breakdown?.[blank.id] && !finalResults && (
                    <div
                      className={
                        checkResults.breakdown[blank.id].correct
                          ? styles.feedbackCorrect
                          : styles.feedbackIncorrect
                      }
                    >
                      {checkResults.breakdown[blank.id].correct
                        ? "✓ Correct"
                        : "✗ Incorrect"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
