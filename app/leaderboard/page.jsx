import React from "react";

export default async function LeaderboardPage() {
  const res = await fetch("/api/leaderboard", { cache: "no-store" });
  const data = await res.json();
  const rows = data.leaderboard || [];

  return (
    <main style={{ padding: 20 }}>
      <h1>Leaderboard</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              Rank
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              Name
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.token}>
              <td style={{ padding: "8px 0" }}>{i + 1}</td>
              <td style={{ padding: "8px 0" }}>
                {r.participantName || r.token}
              </td>
              <td style={{ padding: "8px 0" }}>{r.score}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3}>No submissions yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
