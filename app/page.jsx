"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleStart = () => {
    // Generate a random token
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Store token and name in localStorage
    localStorage.setItem("quizToken", token);
    // mark quiz as started for this session
    localStorage.setItem("quizStarted", "1");
    // set quiz end time so the timer always starts at the full duration
    const end = Date.now() + 1800 * 1000; // 30 minutes in ms
    localStorage.setItem("quizEndTime", end.toString());
    if (name.trim()) {
      localStorage.setItem("participantName", name.trim());
    }

    // Navigate to quiz
    router.push("/quiz");
  };

  const handleLogin = () => {
    router.push("/admin/login");
  };

  return (
    <div className={styles.container}>
      <button onClick={handleLogin} className={styles.loginButton}>
        Login
      </button>
      <div className={styles.startCard}>
        <h1 className={styles.title}>HTML Fill-in-the-Blanks Quiz</h1>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Participant Name (optional):</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className={styles.input}
          />
        </div>
        <button onClick={handleStart} className={styles.startButton}>
          Start Quiz
        </button>
      </div>
    </div>
  );
}

