"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SubmitWorkForm({
  challengeId,
  teamId,
  existing,
}: {
  challengeId: string;
  teamId: string | null;
  existing: any;
}) {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState(existing?.fileUrl || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (files && files[0]) {
      setDroppedFile(files[0]);
      setError("");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }

  async function uploadFileToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || "File upload failed");
    }

    return data.url as string;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fileUrl && !droppedFile) {
      setError("Add a project link or attach a file");
      return;
    }

    let finalFileUrl = fileUrl;

    if (droppedFile) {
      setUploading(true);
      try {
        finalFileUrl = await uploadFileToCloudinary(droppedFile);
      } catch (err: any) {
        setUploading(false);
        setError(err.message || "File upload failed. Please try again.");
        return;
      }
      setUploading(false);
    }

    setLoading(true);

    try {
    const res = await fetch(`/api/challenges/${challengeId}/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl: finalFileUrl, description, teamId }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push(`/dashboard/challenge/${challengeId}`), 1200);
    } catch {
      setLoading(false);
      setError("Could not save your submission. Please try again.");
    }
  }

  const busy = loading || uploading;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff",
        borderRadius: 18,
        border: "1px solid rgba(15,23,42,0.07)",
        padding: "clamp(18px, 5vw, 28px)",
        width: "100%",
        maxWidth: 600,
        display: "flex",
        flexDirection: "column",
        gap: 18,
        animation: "sfIn 0.4s cubic-bezier(.2,.8,.2,1)",
      }}
    >
      <style>{`
        @keyframes sfIn { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform: translateY(0);} }
        .drop-zone { transition: background 0.2s ease, border-color 0.2s ease; }
        .drop-zone:hover { background: #F6F4FF; }
        .drop-zone.active { border-color: #6D4AFF !important; background: #F1EEFF; }
        .drop-zone:focus-visible { outline: 3px solid rgba(109,74,255,0.3); outline-offset: 3px; }
        .sub-btn { transition: transform 0.15s ease, box-shadow 0.25s ease; }
        .sub-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(109,74,255,0.3); }
        @media (prefers-reduced-motion: reduce) { .sub-btn, .drop-zone { transition: none !important; } }
      `}</style>

      <div>
        <label id="submission-file-label" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(20,19,43,0.5)", marginBottom: 8, textTransform: "uppercase" }}>
          Attach File or Folder
        </label>
        <div
          className={"drop-zone" + (dragActive ? " active" : "")}
          role="button"
          tabIndex={0}
          aria-labelledby="submission-file-label"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: "2px dashed rgba(109,74,255,0.3)",
            borderRadius: 14,
            padding: "28px 16px",
            textAlign: "center",
            cursor: "pointer",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple={false}
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
          {droppedFile ? (
            <div>
              <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "#14132B" }}>{droppedFile.name}</p>
              <p style={{ fontSize: 11.5, color: "rgba(20,19,43,0.4)", marginTop: 2 }}>
                {(droppedFile.size / 1024).toFixed(1)} KB — click to replace
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 26, marginBottom: 6 }}>📁</div>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#14132B" }}>Drag & drop a file here</p>
              <p style={{ fontSize: 12, color: "rgba(20,19,43,0.4)", marginTop: 2 }}>or click to browse — PDF, ZIP, or any file</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(20,19,43,0.3)", fontSize: 12 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(15,23,42,0.08)" }} />
        OR
        <div style={{ flex: 1, height: 1, background: "rgba(15,23,42,0.08)" }} />
      </div>

      <div>
        <label htmlFor="project-link" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(20,19,43,0.5)", marginBottom: 6, textTransform: "uppercase" }}>
          Project Link
        </label>
        <input
          id="project-link"
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://github.com/you/project"
          disabled={!!droppedFile}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(15,23,42,0.08)",
            background: droppedFile ? "rgba(15,23,42,0.04)" : "#F6F5FB",
            fontSize: 14,
            outline: "none",
            cursor: droppedFile ? "not-allowed" : "text",
          }}
        />
      </div>

      <div>
        <label htmlFor="project-description" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(20,19,43,0.5)", marginBottom: 6, textTransform: "uppercase" }}>
          Title / Description
        </label>
        <textarea
          id="project-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you build?"
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(15,23,42,0.08)",
            background: "#F6F5FB",
            fontSize: 14,
            outline: "none",
            minHeight: 100,
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      </div>

      {error && (
        <div role="alert" style={{ background: "rgba(255,70,70,0.05)", border: "1px solid rgba(255,70,70,0.15)", borderRadius: 10, padding: "10px 14px", color: "#d32f2f", fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {success && (
        <div role="status" style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 10, padding: "10px 14px", color: "#15803D", fontSize: 13 }}>
          ✓ Submitted successfully! Redirecting...
        </div>
      )}

      <button
        type="submit"
        className="sub-btn"
        disabled={busy}
        style={{
          background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          padding: "14px",
          fontSize: 14,
          fontWeight: 700,
          cursor: busy ? "not-allowed" : "pointer",
          opacity: busy ? 0.6 : 1,
          boxShadow: "0 8px 20px rgba(109,74,255,0.25)",
        }}
      >
        {uploading ? "Uploading file..." : loading ? "Submitting..." : existing ? "Update Submission" : "Submit Work"}
      </button>
    </form>
  );
}
