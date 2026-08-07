"use client";

import { useEffect, useState } from "react";

// ─── styles ──────────────────────────────────────────────────────
const styles = `
  .challenge-card {
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    background: #fff;
    transition: box-shadow 0.2s;
  }

  .challenge-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .challenge-card h3 {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 600;
    color: #111;
  }

  .challenge-meta {
    font-size: 13px;
    color: #666;
    margin: 0 0 6px 0;
  }

  .challenge-desc {
    margin: 8px 0 0 0;
    font-size: 14px;
    color: #333;
  }

  .challenge-prize {
    margin: 4px 0 0 0;
    font-weight: 600;
    font-size: 15px;
    color: #2e7d32;
  }
`;

// ─── component ──────────────────────────────────────────────────
export default function ChallengeList() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/challenges")
      .then((res) => res.json())
      .then((data) => {
        setChallenges(data.challenges || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (challenges.length === 0) return <p>No challenges created yet.</p>;

  return (
    <>
      <style>{styles}</style>
      <div>
        {challenges.map((c) => (
          <div key={c.id} className="challenge-card">
            <h3>{c.title}</h3>
            <p className="challenge-meta">
              {c.type} • Deadline: {new Date(c.deadline).toLocaleString()}
            </p>
            {c.description && <p className="challenge-desc">{c.description}</p>}
            {c.prize && <p className="challenge-prize">🏆 {c.prize}</p>}
          </div>
        ))}
      </div>
    </>
  );
}