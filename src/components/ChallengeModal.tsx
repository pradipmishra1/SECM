"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TypeBadge } from "./Badges";
import ChallengeComments from "./ChallengeComments";

function isClosed(challenge: any) {
  return (
    new Date(challenge.deadline).getTime() < Date.now() ||
    challenge.status === "CLOSED" ||
    challenge.status === "COMPLETED"
  );
}

export default function ChallengeModal({
  challenge,
  onClose,
  joined,
  alreadySubmitted,
  myTeam,
  currentUserId,
  isOrganizer = false,
}: {
  challenge: any;
  onClose: () => void;
  joined: boolean;
  alreadySubmitted?: boolean;
  myTeam?: { id: string; name: string } | null;
  currentUserId?: string;
  isOrganizer?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isJoined, setIsJoined] = useState(joined);
  const [mode, setMode] = useState<"details" | "submit">("details");

  async function joinSolo() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/challenges/${challenge.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinType: "SOLO" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to join");
      return;
    }
    setIsJoined(true);
    router.refresh();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,19,43,0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        animation: "fadeBg 0.25s ease",
      }}
    >
      <style>{`
        @keyframes fadeBg { from { opacity:0 } to { opacity:1 } }
        @keyframes popModal { from { opacity:0; transform: scale(0.94) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 22,
          padding: 28,
          width: 520,
          maxHeight: "85vh",
          overflowY: "auto",
          animation: "popModal 0.3s cubic-bezier(.2,.8,.2,1)",
          boxShadow: "0 30px 60px rgba(20,19,43,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <TypeBadge type={challenge.type} />
            {isClosed(challenge) && (
              <span style={{ fontSize: 11.5, fontWeight: 700, background: "rgba(220,38,38,0.1)", color: "#B91C1C", padding: "4px 10px", borderRadius: 20 }}>
                Closed
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(20,19,43,0.05)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 15, color: "rgba(20,19,43,0.5)" }}
          >
            ✕
          </button>
        </div>

        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700, color: "#14132B", marginBottom: 4 }}>
          {challenge.title}
        </h2>
        <p style={{ fontSize: 13, color: "rgba(20,19,43,0.5)", marginBottom: 20 }}>
          By {challenge.organizer?.orgName || "Organizer"}
        </p>

        {mode === "details" ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(20,19,43,0.5)", textTransform: "uppercase", marginBottom: 6 }}>
                Description
              </h4>
              <p style={{ fontSize: 14, color: "rgba(20,19,43,0.7)", lineHeight: 1.6 }}>
                {challenge.description || "No description provided."}
              </p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(20,19,43,0.5)", textTransform: "uppercase", marginBottom: 6 }}>
                Requirements / Rules
              </h4>
              <p style={{ fontSize: 14, color: "rgba(20,19,43,0.7)", lineHeight: 1.6 }}>
                {challenge.rules || "No specific rules provided."}
              </p>
            </div>

            <div style={{ display: "flex", gap: 20, marginBottom: 22, fontSize: 13 }}>
              <div>
                <span style={{ color: "rgba(20,19,43,0.45)" }}>Deadline: </span>
                <strong style={{ color: "#14132B" }}>{new Date(challenge.deadline).toLocaleString()}</strong>
              </div>
              {challenge.prize && (
                <div>
                  <span style={{ color: "rgba(20,19,43,0.45)" }}>Prize: </span>
                  <strong style={{ color: "#D97706" }}>{challenge.prize}</strong>
                </div>
              )}
            </div>

            {error && (
              <div style={{ background: "rgba(255,70,70,0.06)", color: "#d32f2f", fontSize: 13, padding: "10px 14px", borderRadius: 10, marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            {isOrganizer ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1, background: "rgba(109,74,255,0.06)", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#6D4AFF", fontFamily: "'Sora', sans-serif" }}>
                      {challenge._count?.submissions ?? "—"}
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(20,19,43,0.5)", fontWeight: 600 }}>Submissions</div>
                  </div>
                  <div style={{ flex: 1, background: "rgba(37,99,235,0.06)", borderRadius: 12, padding: "14px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#2563EB", fontFamily: "'Sora', sans-serif" }}>
                      {challenge._count?.participations ?? "—"}
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(20,19,43,0.5)", fontWeight: 600 }}>Participants</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => router.push(`/dashboard/review?challenge=${challenge.id}`)}
                    style={{ flex: 1, background: "#14132B", color: "#fff", border: "none", borderRadius: 12, padding: 13, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
                  >
                    Review Submissions
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/winners?challenge=${challenge.id}`)}
                    style={{ flex: 1, background: "rgba(109,74,255,0.08)", color: "#6D4AFF", border: "1px solid rgba(109,74,255,0.2)", borderRadius: 12, padding: 13, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
                  >
                    Manage Winners
                  </button>
                </div>
              </div>
            ) : isClosed(challenge) ? (
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  background: "rgba(107,114,128,0.1)",
                  color: "#6B7280",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                🔒 This challenge is closed
              </div>
            ) : isJoined && alreadySubmitted ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    background: "rgba(22,163,74,0.1)",
                    color: "#15803D",
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  ✅ Already Submitted
                </div>
                <button
                  onClick={() => setMode("submit")}
                  style={{
                    width: "100%",
                    background: "rgba(109,74,255,0.08)",
                    color: "#6D4AFF",
                    border: "1px solid rgba(109,74,255,0.2)",
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Update Submission
                </button>
              </div>
            ) : isJoined ? (
              <button
                onClick={() => setMode("submit")}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Submit Your Work
              </button>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={joinSolo}
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Joining..." : "Join Solo"}
                </button>
                <button
                  onClick={() => router.push(`/dashboard/challenge/${challenge.id}/create-team`)}
                  style={{
                    flex: 1,
                    background: "#14132B",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Create Team
                </button>
              </div>
           )}

            {currentUserId && !isOrganizer && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(15,23,42,0.06)" }}>
                <ChallengeComments challengeId={challenge.id} currentUserId={currentUserId} />
              </div>
            )}
            {currentUserId && isOrganizer && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(15,23,42,0.06)" }}>
                <ChallengeComments challengeId={challenge.id} currentUserId={currentUserId} />
              </div>
            )}
          </>
        ) : (
          <InlineSubmitForm challengeId={challenge.id} onDone={onClose} teamId={myTeam?.id || null} />
        )}
      </div>
    </div>
  );
}

function InlineSubmitForm({ challengeId, onDone, teamId }: { challengeId: string; onDone: () => void; teamId?: string | null }) {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError("");
    }
  }

  async function uploadFileToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "File upload failed");
    }

    return data.url as string;
  }

  async function submit() {
    setError("");
    if (!fileUrl && !selectedFile) {
      setError("Add a link or choose a file");
      return;
    }

    let finalUrl = fileUrl;

    if (selectedFile) {
      setUploading(true);
      try {
        finalUrl = await uploadFileToCloudinary(selectedFile);
      } catch (err: any) {
        setUploading(false);
        setError(err.message || "File upload failed. Please try again.");
        return;
      }
      setUploading(false);
    }

    setLoading(true);
    const res = await fetch(`/api/challenges/${challengeId}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl: finalUrl, description, teamId: teamId || null }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      onDone();
      router.refresh();
    }, 1000);
  }

  const busy = loading || uploading;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label
          htmlFor="modal-file-input"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            border: "1px solid rgba(15,23,42,0.1)",
            borderRadius: 12,
            padding: "14px",
            background: "#F6F5FB",
            cursor: "pointer",
            fontSize: 13.5,
            fontWeight: 600,
            color: "#6D4AFF",
          }}
        >
          📎 {selectedFile ? "Change File" : "Choose a File to Upload"}
        </label>
        <input id="modal-file-input" type="file" style={{ display: "none" }} onChange={handleFileChange} />
        {selectedFile && (
          <p style={{ fontSize: 12, color: "rgba(20,19,43,0.5)", marginTop: 6, textAlign: "center" }}>
            {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(20,19,43,0.3)", fontSize: 12 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(15,23,42,0.08)" }} />
        OR
        <div style={{ flex: 1, height: 1, background: "rgba(15,23,42,0.08)" }} />
      </div>

      <input
        value={fileUrl}
        onChange={(e) => setFileUrl(e.target.value)}
        placeholder="Paste a project link"
        disabled={!!selectedFile}
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(15,23,42,0.1)",
          background: selectedFile ? "rgba(15,23,42,0.04)" : "#fff",
          boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          fontSize: 13.5,
          outline: "none",
          color: "#14132B",
          cursor: selectedFile ? "not-allowed" : "text",
        }}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Title / description of your work"
        style={{
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(15,23,42,0.1)",
          background: "#fff",
          boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          fontSize: 13.5,
          outline: "none",
          minHeight: 80,
          resize: "vertical",
          fontFamily: "inherit",
          color: "#14132B",
        }}
      />

      {error && (
        <div style={{ background: "rgba(255,70,70,0.06)", color: "#d32f2f", fontSize: 13, padding: "10px 14px", borderRadius: 10, marginBottom: 16 }}>
          ⚠ {error}
        </div>
      )}
      {success && (
        <div style={{ background: "rgba(22,163,74,0.08)", color: "#15803D", fontSize: 13, padding: "10px 14px", borderRadius: 10 }}>
          ✓ Submitted!
        </div>
      )}

      <button
        onClick={submit}
        disabled={busy}
        style={{
          background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: 14,
          fontSize: 14,
          fontWeight: 700,
          cursor: busy ? "not-allowed" : "pointer",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {uploading ? "Uploading file..." : loading ? "Submitting..." : "Submit Work"}
      </button>
    </div>
  );
}