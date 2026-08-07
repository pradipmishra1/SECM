"use client";
import { useState } from "react";

export type Criterion = { name: string; maxScore: number };

export default function RubricEditor({ criteria, onChange }: { criteria: Criterion[]; onChange: (c: Criterion[]) => void }) {
  const [nameInput, setNameInput] = useState("");

  function addCriterion() {
    if (!nameInput.trim()) return;
    onChange([...criteria, { name: nameInput.trim(), maxScore: 10 }]);
    setNameInput("");
  }

  function removeCriterion(i: number) {
    onChange(criteria.filter((_, idx) => idx !== i));
  }

  function updateMaxScore(i: number, value: string) {
    const num = Math.max(1, Math.min(100, parseInt(value) || 10));
    const next = [...criteria];
    next[i] = { ...next[i], maxScore: num };
    onChange(next);
  }

  return (
    <div>
      <style>{`
        @keyframes critIn { from { opacity:0; transform: translateX(-6px); } to { opacity:1; transform: translateX(0); } }
        .crit-row { animation: critIn 0.25s ease both; }
        .crit-add-btn { transition: transform 0.15s ease, background 0.15s ease; }
        .crit-add-btn:hover { transform: translateY(-1px); background: #5a3ce0 !important; }
        .crit-score-input:focus { border-color: rgba(109,74,255,0.4) !important; }
        .crit-remove { transition: transform 0.15s ease, color 0.15s ease; }
        .crit-remove:hover { transform: scale(1.2); color: #B91C1C !important; }
      `}</style>
      {criteria.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {criteria.map((c, i) => (
            <div
              key={i}
              className="crit-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#F6F5FB",
                borderRadius: 10,
                padding: "8px 12px",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#14132B" }}>{c.name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)" }}>out of</span>
                <input
                  type="number"
                  className="crit-score-input"
                  value={c.maxScore}
                  onChange={(e) => updateMaxScore(i, e.target.value)}
                  min={1}
                  max={100}
                  style={{
                    width: 48,
                    padding: "4px 6px",
                    borderRadius: 6,
                    border: "1px solid rgba(15,23,42,0.1)",
                    background: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#14132B",
                    outline: "none",
                    textAlign: "center",
                  }}
                />
                <span onClick={() => removeCriterion(i)} className="crit-remove" style={{ cursor: "pointer", color: "#d32f2f", fontSize: 16, fontWeight: 700 }}>
                  ×
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCriterion())}
          placeholder="e.g. Innovation, Execution, Presentation"
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(15,23,42,0.08)",
            background: "#fff",
            fontSize: 13.5,
            outline: "none",
            color: "#14132B",
          }}
        />
        <button
          type="button"
          onClick={addCriterion}
          className="crit-add-btn"
          style={{ background: "#6D4AFF", color: "#fff", border: "none", borderRadius: 10, width: 42, fontSize: 18, cursor: "pointer" }}
        >
          +
        </button>
      </div>
      <p style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)", marginTop: 8 }}>
        Leave empty to use simple 0-10 scoring instead.
      </p>
    </div>
  );
}