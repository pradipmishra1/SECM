"use client";

import { useState } from "react";

export default function FriendButton({
  targetUserId,
  initialStatus,
  friendshipId,
  onStatusChange,
}: {
  targetUserId: string;
  initialStatus: string;
  friendshipId?: string | null;
  onStatusChange?: (status: string) => void;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function unfriend() {
    if (!friendshipId) return;
    setLoading(true);
    const res = await fetch(`/api/friends/${friendshipId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      setStatus("NONE");
      setConfirming(false);
      onStatusChange?.("NONE");
    }
  }

  async function sendRequest() {
    setLoading(true);
    const res = await fetch("/api/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
    });
    setLoading(false);
    if (res.ok) {
      setStatus("REQUEST_SENT");
      onStatusChange?.("REQUEST_SENT");
    }
  }

  if (status === "SELF") return null;

  if (status === "FRIENDS") {
    if (confirming) {
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={unfriend}
            disabled={loading}
            style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "#DC2626", border: "none", padding: "7px 12px", borderRadius: 20, cursor: "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "..." : "Confirm unfriend"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            style={{ fontSize: 12, fontWeight: 700, color: "#14132B", background: "rgba(20,19,43,0.06)", border: "none", padding: "7px 12px", borderRadius: 20, cursor: "pointer" }}
          >
            Cancel
          </button>
        </span>
      );
    }
    return (
      <button
        onClick={() => setConfirming(true)}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "#15803D", background: "rgba(22,163,74,0.1)", padding: "7px 14px", borderRadius: 20, border: "none", cursor: "pointer" }}
      >
        ✓ Friends
      </button>
    );
  }

  if (status === "REQUEST_SENT") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "rgba(20,19,43,0.5)", background: "rgba(20,19,43,0.05)", padding: "7px 14px", borderRadius: 20 }}>
        Request sent
      </span>
    );
  }

  if (status === "REQUEST_RECEIVED") {
    return (
      <a href="/dashboard/friends" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "#6D4AFF", background: "rgba(109,74,255,0.1)", padding: "7px 14px", borderRadius: 20, textDecoration: "none" }}>
        Respond to request
      </a>
    );
  }

  return (
    <button
      onClick={sendRequest}
      disabled={loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12.5,
        fontWeight: 700,
        color: "#fff",
        background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)",
        border: "none",
        padding: "7px 16px",
        borderRadius: 20,
        cursor: "pointer",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? "Sending..." : "+ Add Friend"}
    </button>
  );
}


export function FollowButton({
  targetUserId,
  initialIsFollowing,
  followsYou,
}: {
  targetUserId: string;
  initialIsFollowing: boolean;
  followsYou?: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [failed, setFailed] = useState(false);

  async function toggleFollow() {
    const previousState = isFollowing;
    const nextState = !isFollowing;

    // Optimistic update: flip instantly, no waiting
    setIsFollowing(nextState);
    setFailed(false);

    try {
      if (previousState) {
        const res = await fetch(`/api/follow?targetUserId=${targetUserId}`, { method: "DELETE" });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId }),
        });
        if (!res.ok) throw new Error();
      }
    } catch {
      // Roll back on failure
      setIsFollowing(previousState);
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    }
  }

  return (
    <button
      onClick={toggleFollow}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12.5,
        fontWeight: 700,
        color: failed ? "#DC2626" : isFollowing ? "#14132B" : "#6D4AFF",
        background: failed ? "rgba(220,38,38,0.08)" : isFollowing ? "rgba(20,19,43,0.06)" : "rgba(109,74,255,0.1)",
        border: "none",
        padding: "7px 16px",
        borderRadius: 20,
        cursor: "pointer",
        transition: "background 0.15s ease, color 0.15s ease",
      }}
    >
           {failed ? "Failed, retry" : isFollowing ? "Following" : followsYou ? "Follow Back" : "+ Follow"}
    </button>
  );
}