"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RubricEditor, { Criterion } from "./RubricEditor";

const TYPES = [
  { value: "HACKATHON", label: "Hackathon", icon: "🚀" },
  { value: "CODING_CONTEST", label: "Coding Contest", icon: "💻" },
  { value: "DESIGN_CHALLENGE", label: "Design Challenge", icon: "🎨" },
  { value: "IDEA_PITCHING", label: "Idea Pitching", icon: "💡" },
];

function nowLocalISOString() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function CreateChallengeForm({ isVerified = false }: { isVerified?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiFeatureOn, setAiFeatureOn] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    fetch("/api/feature-flags")
      .then((r) => r.json())
      .then((d) => {
        const flag = (d.flags || []).find((f: any) => f.key === "AI_REVIEW");
        setAiFeatureOn(!!flag?.enabled);
      });
    fetch("/api/subscription/status")
      .then((r) => r.json())
      .then((d) => setHasSubscription(!!d.active));
  }, []);

  async function startCheckout() {
    setPayLoading(true);
    const res = await fetch("/api/subscription/khalti-initiate", { method: "POST" });
    const data = await res.json();
    setPayLoading(false);
    if (data.paymentUrl) {
      window.location.href = data.paymentUrl;
    } else {
      setError(data.error || "Could not start payment");
    }
  }

  const [title, setTitle] = useState("");
  const [type, setType] = useState("HACKATHON");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [deadline, setDeadline] = useState("");
  const [prizeFirst, setPrizeFirst] = useState("");
  const [prizeSecond, setPrizeSecond] = useState("");
  const [prizeThird, setPrizeThird] = useState("");
  const [maxTeamSize, setMaxTeamSize] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([]);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "#F6F5FB",
    fontSize: 13.5,
    fontFamily: "Inter, sans-serif",
    outline: "none",
    color: "#14132B",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11.5,
    fontWeight: 700,
    color: "rgba(20,19,43,0.5)",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  };

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

        const res = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type, description, rules, deadline, prizeFirst, prizeSecond, prizeThird, maxTeamSize, tags }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Something went wrong");
      return;
    }

    if (criteria.length > 0 && data.challenge?.id) {
      await fetch(`/api/challenges/${data.challenge.id}/rubric`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criteria }),
      });
    }

    setLoading(false);
    router.push("/dashboard/my-challenges");
  }

  const typeInfo = TYPES.find((t) => t.value === type);

  return (
    <div>
      <style>{`
        @keyframes ccfFade { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .ccf-input:focus { border-color: rgba(109,74,255,0.4) !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(109,74,255,0.08); }
        .ccf-type-pill { transition: all 0.2s ease; cursor: pointer; }
        .ccf-type-pill:hover:not(.ccf-type-active) { background: rgba(109,74,255,0.06) !important; }
        .ccf-tag-chip { animation: ccfFade 0.2s ease both; }
        .ccf-submit-btn { transition: transform 0.15s ease, box-shadow 0.2s ease; }
        .ccf-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(109,74,255,0.35); }
        .ccf-preview-card { animation: ccfFade 0.4s ease both; }
        @keyframes ccfSpin { to { transform: rotate(360deg); } }
        .ccf-spinner { animation: ccfSpin 0.7s linear infinite; }
      `}</style>

     <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#14132B", marginBottom: 6, letterSpacing: -0.5 }}>
          Create a Challenge
        </h1>
        <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14 }}>
          Set up a hackathon, coding contest, or design sprint for students to join.
        </p>
      </div>

      {!isVerified && (
        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#92400E", display: "flex", alignItems: "center", gap: 10 }}>
          ⏳ Your account isn't verified yet — challenges you create will be saved as drafts and won't be visible to students until an admin verifies your organization.
        </div>
      )}

      {aiFeatureOn && !hasSubscription && (
        <div style={{ background: "linear-gradient(135deg,#14132B,#3B2E7A)", borderRadius: 18, padding: "22px 24px", marginBottom: 20, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -30, right: -20, width: 140, height: 140, borderRadius: "50%", background: "rgba(109,74,255,0.25)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                ✨ Unlock AI Review
              </p>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", maxWidth: 380 }}>
                Let AI read submitted files, suggest scores and feedback, and speed up your judging — Rs 99/month.
              </p>
            </div>
            <button
              onClick={startCheckout}
              disabled={payLoading}
              style={{
                background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", border: "none", borderRadius: 12,
                padding: "12px 22px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                opacity: payLoading ? 0.6 : 1,
              }}
            >
              {payLoading ? "Redirecting..." : "Pay with Khalti — Rs 99"}
            </button>
          </div>
        </div>
      )}

      {aiFeatureOn && hasSubscription && (
        <div style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 14, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#15803D", display: "flex", alignItems: "center", gap: 10 }}>
          ✅ AI Review is active on your account — you'll see the AI Score option on submissions.
        </div>
      )}

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 26,
            flex: 2,
            border: "1px solid rgba(15,23,42,0.07)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div>
            <label style={labelStyle}>Title</label>
            <input className="ccf-input" style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Campus AI Hackathon 2026" />
          </div>

          <div>
            <label style={labelStyle}>Type</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {TYPES.map((t) => (
                <div
                  key={t.value}
                  className={"ccf-type-pill" + (type === t.value ? " ccf-type-active" : "")}
                  onClick={() => setType(t.value)}
                  style={{
                    padding: "9px 14px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: type === t.value ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "#F6F5FB",
                    color: type === t.value ? "#fff" : "#14132B",
                    border: type === t.value ? "none" : "1px solid rgba(15,23,42,0.06)",
                  }}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              className="ccf-input"
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              placeholder="What's this challenge about?"
            />
            <p style={{ fontSize: 11, color: "rgba(20,19,43,0.35)", marginTop: 4, textAlign: "right" }}>{description.length}/1000</p>
          </div>

          <div>
            <label style={labelStyle}>Rules</label>
            <textarea
              className="ccf-input"
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              maxLength={1000}
              placeholder="Eligibility, submission format, judging criteria..."
            />
            <p style={{ fontSize: 11, color: "rgba(20,19,43,0.35)", marginTop: 4, textAlign: "right" }}>{rules.length}/1000</p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Deadline</label>
              <input
                type="datetime-local"
                className="ccf-input"
                style={inputStyle}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={nowLocalISOString()}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Max Team Size</label>
              <input
                type="number"
                className="ccf-input"
                style={inputStyle}
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(e.target.value)}
                placeholder="e.g. 4"
                min={1}
              />
            </div>
          </div>

                   <div>
            <label style={labelStyle}>Prizes</label>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "rgba(20,19,43,0.4)", marginBottom: 5, display: "block" }}>🥇 1st Place</label>
                <input className="ccf-input" style={inputStyle} value={prizeFirst} onChange={(e) => setPrizeFirst(e.target.value)} placeholder="e.g. Rs. 10,000" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "rgba(20,19,43,0.4)", marginBottom: 5, display: "block" }}>🥈 2nd Place</label>
                <input className="ccf-input" style={inputStyle} value={prizeSecond} onChange={(e) => setPrizeSecond(e.target.value)} placeholder="e.g. Rs. 5,000" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "rgba(20,19,43,0.4)", marginBottom: 5, display: "block" }}>🥉 3rd Place</label>
                <input className="ccf-input" style={inputStyle} value={prizeThird} onChange={(e) => setPrizeThird(e.target.value)} placeholder="e.g. Rs. 2,000" />
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: tags.length > 0 ? 8 : 0 }}>
              {tags.map((t) => (
                <span
                  key={t}
                  className="ccf-tag-chip"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(109,74,255,0.08)",
                    color: "#6D4AFF",
                    fontSize: 12.5,
                    fontWeight: 600,
                    padding: "5px 10px",
                    borderRadius: 20,
                  }}
                >
                  {t}
                  <span onClick={() => removeTag(t)} style={{ cursor: "pointer", fontWeight: 700 }}>×</span>
                </span>
              ))}
            </div>
            <input
              className="ccf-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              style={inputStyle}
              placeholder="Type a tag and press Enter (e.g. Web Dev, AI)"
            />
          </div>

          <div>
            <label style={labelStyle}>Scoring Rubric (optional)</label>
            <RubricEditor criteria={criteria} onChange={setCriteria} />
          </div>

          {error && (
            <div style={{ background: "rgba(255,70,70,0.06)", border: "1px solid rgba(255,70,70,0.15)", borderRadius: 10, padding: "10px 14px", color: "#d32f2f", fontSize: 13 }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="ccf-submit-btn"
            style={{
              background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
              color: "#fff",
              border: "none",
              borderRadius: 14,
              padding: "14px",
              fontSize: 14.5,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {loading && <span className="ccf-spinner" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%" }} />}
            {loading ? "Creating..." : "Create Challenge"}
          </button>
        </form>

        {/* Live preview */}
        <div className="ccf-preview-card" style={{ flex: 1, position: "sticky", top: 20 }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: "rgba(20,19,43,0.4)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
            Preview
          </p>
          <div style={{ background: "#fff", borderRadius: 20, border: "1px solid rgba(15,23,42,0.07)", padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#6D4AFF", background: "rgba(109,74,255,0.08)", padding: "4px 10px", borderRadius: 20 }}>
                {typeInfo?.icon} {typeInfo?.label}
              </span>
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#14132B", marginBottom: 8, lineHeight: 1.3 }}>
              {title || "Your challenge title"}
            </h3>
            <p style={{ fontSize: 12.5, color: "rgba(20,19,43,0.55)", lineHeight: 1.5, marginBottom: 14 }}>
              {description || "Description will appear here..."}
            </p>
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                {tags.map((t) => (
                  <span key={t} style={{ fontSize: 11, color: "rgba(20,19,43,0.5)", background: "#F6F5FB", padding: "3px 8px", borderRadius: 12 }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid rgba(15,23,42,0.06)" }}>
              <span style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)" }}>
                {deadline ? new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No deadline set"}
              </span>
                           {prizeFirst && (
                <span style={{ fontSize: 12, fontWeight: 700, color: "#D97706", background: "rgba(217,119,6,0.06)", padding: "3px 10px", borderRadius: 20 }}>
                  🏆 {prizeFirst}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}