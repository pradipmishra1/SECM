"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTeamForm({ challengeId }: { challengeId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/challenges/${challengeId}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    router.push(`/dashboard/challenge/${challengeId}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff",
        borderRadius: 18,
        border: "1px solid rgba(15,23,42,0.07)",
        padding: 26,
        maxWidth: 480,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(20,19,43,0.5)", marginBottom: 6, textTransform: "uppercase" }}>
          Team Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. ByteBrigade"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(15,23,42,0.08)",
            background: "#F6F5FB",
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>

      {error && (
        <div style={{ background: "rgba(255,70,70,0.05)", border: "1px solid rgba(255,70,70,0.15)", borderRadius: 10, padding: "10px 14px", color: "#d32f2f", fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "13px",
          fontSize: 14,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Creating..." : "Create Team & Join"}
      </button>
    </form>
  );
}