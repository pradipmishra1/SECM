"use client";

import { useState } from "react";

// ─── styles ──────────────────────────────────────────────────────
const styles = `
  .dash-card {
    background: #f8f8f8;
    padding: 20px;
    border-radius: 12px;
    max-width: 500px;
    margin: 0 auto;
  }

  .dash-input,
  .dash-select,
  .dash-textarea {
    width: 100%;
    padding: 10px 12px;
    margin-bottom: 12px;
    border-radius: 8px;
    border: 1px solid rgba(0,0,0,0.15);
    font-size: 14px;
    font-family: inherit;
    background: #fff;
    transition: border-color 0.2s;
  }

  .dash-input:focus,
  .dash-select:focus,
  .dash-textarea:focus {
    border-color: #7c5cfc;
    outline: none;
    box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.2);
  }

  .dash-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .dash-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #555;
    margin-bottom: 4px;
  }

  .dash-error {
    color: #d32f2f;
    font-size: 13px;
    margin-bottom: 12px;
    background: rgba(211, 47, 47, 0.06);
    padding: 8px 12px;
    border-radius: 6px;
  }

  .dash-success {
    color: #2e7d32;
    font-size: 13px;
    margin-bottom: 12px;
    background: rgba(46, 125, 50, 0.06);
    padding: 8px 12px;
    border-radius: 6px;
  }

  .dash-btn {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: #7c5cfc;
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    width: 100%;
  }

  .dash-btn:hover:not(:disabled) {
    background: #6a4be0;
  }

  .dash-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// ─── component ──────────────────────────────────────────────────
export default function ChallengeForm() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("HACKATHON");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [deadline, setDeadline] = useState("");
  const [prize, setPrize] = useState("");
  const [maxTeamSize, setMaxTeamSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type, description, rules, deadline, prize, maxTeamSize }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }

    setSuccess(true);
    setTitle("");
    setDescription("");
    setRules("");
    setDeadline("");
    setPrize("");
    setMaxTeamSize("");
    window.location.reload();
  }

  return (
    <>
      <style>{styles}</style>
      <form onSubmit={handleSubmit} className="dash-card">
        <input
          className="dash-input"
          placeholder="Challenge title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select className="dash-select" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="HACKATHON">Hackathon</option>
          <option value="CODING_CONTEST">Coding Contest</option>
          <option value="DESIGN_CHALLENGE">Design Challenge</option>
          <option value="IDEA_PITCHING">Idea Pitching</option>
        </select>

        <textarea
          className="dash-textarea"
          style={{ minHeight: 80 }}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <textarea
          className="dash-textarea"
          style={{ minHeight: 60 }}
          placeholder="Rules"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
        />

        <label className="dash-label">Deadline</label>
        <input
          className="dash-input"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />

        <input
          className="dash-input"
          placeholder="Prize (e.g. Rs. 10,000)"
          value={prize}
          onChange={(e) => setPrize(e.target.value)}
        />

        <input
          className="dash-input"
          type="number"
          placeholder="Max team size (optional)"
          value={maxTeamSize}
          onChange={(e) => setMaxTeamSize(e.target.value)}
        />

        {error && <div className="dash-error">{error}</div>}
        {success && <div className="dash-success">Challenge created!</div>}

        <button type="submit" disabled={loading} className="dash-btn">
          {loading ? "Creating..." : "Create Challenge"}
        </button>
      </form>
    </>
  );
}