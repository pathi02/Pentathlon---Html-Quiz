'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function AdminDashboard() {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('scores'); // 'scores' or 'quiz'
    
    // Quiz management state
    const [quiz, setQuiz] = useState(null);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizSaving, setQuizSaving] = useState(false);
    
    // Submissions state
    const [submissions, setSubmissions] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        setAuthenticated(true);
        setLoading(false);
        loadSubmissions();
        loadQuiz();
    }, []);

    const loadSubmissions = async () => {
        setSubmissionsLoading(true);
        try {
            const response = await fetch('/api/admin/submissions');
            const data = await response.json();
            if (data.submissions) {
                setSubmissions(data.submissions);
                setStatistics(data.statistics);
            }
        } catch (error) {
            console.error('Failed to load submissions:', error);
        } finally {
            setSubmissionsLoading(false);
        }
    };

    const loadQuiz = async () => {
        setQuizLoading(true);
        try {
            const response = await fetch('/api/admin/quiz');
            const data = await response.json();
            if (data.quiz) {
                setQuiz(data.quiz);
            }
        } catch (error) {
            console.error('Failed to load quiz:', error);
        } finally {
            setQuizLoading(false);
        }
    };

    const handleSaveQuiz = async () => {
        if (!quiz) return;
        
        setQuizSaving(true);
        try {
            const response = await fetch('/api/admin/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quiz })
            });

            const data = await response.json();
            if (data.success) {
                alert('Quiz updated successfully!');
            } else {
                alert('Failed to update quiz');
            }
        } catch (error) {
            alert('Error updating quiz');
        } finally {
            setQuizSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/');
    };

    const updateBlank = (index, field, value) => {
        const newQuiz = { ...quiz };
        newQuiz.blanks[index] = { ...newQuiz.blanks[index], [field]: value };
        setQuiz(newQuiz);
    };

    const addBlank = () => {
        const newQuiz = { ...quiz };
        const newId = `BLANK_${newQuiz.blanks.length + 1}`;
        newQuiz.blanks.push({
            id: newId,
            expected: '',
            points: 10,
            trim: true,
            caseSensitive: false,
            acceptedAnswers: []
        });
        setQuiz(newQuiz);
    };

    const removeBlank = (index) => {
        const newQuiz = { ...quiz };
        newQuiz.blanks.splice(index, 1);
        setQuiz(newQuiz);
    };

    if (loading || !authenticated) {
        return <div className={styles.container}>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Admin Dashboard</h1>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Logout
                </button>
            </div>

            <div className={styles.tabs}>
                <button
                    className={activeTab === 'scores' ? styles.activeTab : styles.tab}
                    onClick={() => setActiveTab('scores')}
                >
                    Score Comparisons
                </button>
                <button
                    className={activeTab === 'quiz' ? styles.activeTab : styles.tab}
                    onClick={() => setActiveTab('quiz')}
                >
                    Manage Quiz
                </button>
            </div>

            {activeTab === 'scores' && (
                <div className={styles.scoresSection}>
                    {statistics && (
                        <div className={styles.statistics}>
                            <div className={styles.statCard}>
                                <h3>Total Submissions</h3>
                                <p className={styles.statValue}>{statistics.total}</p>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Average Score</h3>
                                <p className={styles.statValue}>{statistics.averageScore}</p>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Highest Score</h3>
                                <p className={styles.statValue}>{statistics.maxScore}</p>
                            </div>
                        </div>
                    )}

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Participant Name</th>
                                    <th>Score</th>
                                    <th>Max Score</th>
                                    <th>Percentage</th>
                                    <th>Submitted At</th>
                                    <th>Time Up</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissionsLoading ? (
                                    <tr>
                                        <td colSpan="7" className={styles.center}>Loading...</td>
                                    </tr>
                                ) : submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className={styles.center}>No submissions yet</td>
                                    </tr>
                                ) : (
                                    submissions.map((submission, index) => {
                                        const maxScore = submission.breakdown
                                            ? Object.values(submission.breakdown).reduce((sum, b) => sum + (b.possible || 0), 0)
                                            : 100;
                                        const percentage = Math.round((submission.score / maxScore) * 100);
                                        const date = new Date(submission.timestamp);
                                        
                                        return (
                                            <tr key={submission.token}>
                                                <td>{index + 1}</td>
                                                <td>{submission.participantName || 'Anonymous'}</td>
                                                <td className={styles.scoreCell}>{submission.score}</td>
                                                <td>{maxScore}</td>
                                                <td>{percentage}%</td>
                                                <td>{date.toLocaleString()}</td>
                                                <td>{submission.timeUp ? 'Yes' : 'No'}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'quiz' && (
                <div className={styles.quizSection}>
                    {quizLoading ? (
                        <div>Loading quiz configuration...</div>
                    ) : !quiz ? (
                        <div>Failed to load quiz configuration</div>
                    ) : (
                        <>
                            <div className={styles.quizEditor}>
                                <div className={styles.formGroup}>
                                    <label>Duration (seconds):</label>
                                    <input
                                        type="number"
                                        value={quiz.durationSeconds || 1800}
                                        onChange={(e) => setQuiz({ ...quiz, durationSeconds: parseInt(e.target.value) || 1800 })}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>HTML Template:</label>
                                    <textarea
                                        value={quiz.htmlTemplate || ''}
                                        onChange={(e) => setQuiz({ ...quiz, htmlTemplate: e.target.value })}
                                        className={styles.textarea}
                                        rows={20}
                                        placeholder="Enter HTML template with __BLANK_X__ placeholders"
                                    />
                                </div>

                                <div className={styles.blanksEditor}>
                                    <div className={styles.blanksHeader}>
                                        <h3>Blanks Configuration</h3>
                                        <button onClick={addBlank} className={styles.addButton}>
                                            + Add Blank
                                        </button>
                                    </div>

                                    {quiz.blanks && quiz.blanks.map((blank, index) => (
                                        <div key={index} className={styles.blankEditor}>
                                            <div className={styles.blankRow}>
                                                <div className={styles.formGroup}>
                                                    <label>ID:</label>
                                                    <input
                                                        type="text"
                                                        value={blank.id}
                                                        onChange={(e) => updateBlank(index, 'id', e.target.value)}
                                                        className={styles.input}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Expected Answer:</label>
                                                    <input
                                                        type="text"
                                                        value={blank.expected}
                                                        onChange={(e) => updateBlank(index, 'expected', e.target.value)}
                                                        className={styles.input}
                                                    />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label>Points:</label>
                                                    <input
                                                        type="number"
                                                        value={blank.points}
                                                        onChange={(e) => updateBlank(index, 'points', parseInt(e.target.value) || 0)}
                                                        className={styles.input}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeBlank(index)}
                                                    className={styles.removeButton}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className={styles.blankOptions}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={blank.trim !== false}
                                                        onChange={(e) => updateBlank(index, 'trim', e.target.checked)}
                                                    />
                                                    Trim whitespace
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={blank.caseSensitive === true}
                                                        onChange={(e) => updateBlank(index, 'caseSensitive', e.target.checked)}
                                                    />
                                                    Case sensitive
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSaveQuiz}
                                    disabled={quizSaving}
                                    className={styles.saveButton}
                                >
                                    {quizSaving ? 'Saving...' : 'Save Quiz Configuration'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
