"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function Avatar({ src, name, size = 42 }: { src?: string | null; name: string; size?: number }) {
  return src ? (
    <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.4, flexShrink: 0 }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

export default function FriendsManager({ initialTab }: { initialTab?: "requests" | "friends" | "followers" | "following" }) {
  const router = useRouter();
   const [incoming, setIncoming] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
   const [tab, setTab] = useState<"requests" | "friends" | "followers" | "following">(initialTab || "requests");

  function load() {
    fetch("/api/friends")
      .then((r) => r.json())
      .then((d) => {
        setIncoming(d.incoming || []);
        setFriends(d.friends || []);
        setLoading(false);
      });
    fetch("/api/follow/list")
      .then((r) => r.json())
      .then((d) => {
        setFollowers(d.followers || []);
        setFollowing(d.following || []);
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function respond(id: string, action: "accept" | "decline") {
    setBusyId(id);
    await fetch(`/api/friends/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusyId(null);
    load();
  }

  async function unfriend(id: string) {
    setBusyId(id);
    await fetch(`/api/friends/${id}`, { method: "DELETE" });
    setBusyId(null);
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[
          { key: "requests", label: `Requests${incoming.length > 0 ? ` (${incoming.length})` : ""}` },
          { key: "friends", label: `Friends (${friends.length})` },
          { key: "followers", label: `Followers (${followers.length})` },
          { key: "following", label: `Following (${following.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: tab === t.key ? "linear-gradient(135deg,#6D4AFF,#8B5CF6)" : "rgba(20,19,43,0.05)",
              color: tab === t.key ? "#fff" : "rgba(20,19,43,0.6)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>Loading...</p>
      ) : tab === "requests" ? (
        incoming.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
            <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No pending friend requests.</p>
          </div>










        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {incoming.map((req) => (
              <div key={req.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16, padding: "14px 18px" }}>
                <Avatar src={req.requester.image} name={req.requester.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>{req.requester.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(20,19,43,0.45)" }}>@{req.requester.username}</div>
                </div>
                <button
                  onClick={() => respond(req.id, "accept")}
                  disabled={busyId === req.id}
                  style={{ background: "#16A34A", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", opacity: busyId === req.id ? 0.6 : 1 }}
                >
                  Accept
                </button>
                <button
                  onClick={() => respond(req.id, "decline")}
                  disabled={busyId === req.id}
                  style={{ background: "rgba(20,19,43,0.05)", color: "rgba(20,19,43,0.6)", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", opacity: busyId === req.id ? 0.6 : 1 }}
                >
                  Decline
                </button>
              </div>
            ))}
          </div>
        )
      ) : friends.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No friends yet.</p>
        </div>
            ) : tab === "friends" ? (
        friends.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
            <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No friends yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {friends.map((f) => (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16, padding: "14px 18px" }}>
                <Avatar src={f.image} name={f.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(20,19,43,0.45)" }}>@{f.username}</div>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/messages?to=${f.username}`)}
                  style={{ background: "#6D4AFF", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                >
                  Message
                </button>
              </div>
            ))}
          </div>
        )
      ) : tab === "followers" ? (
        followers.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
            <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>No followers yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {followers.map((f) => (
              <div
                key={f.id}
                onClick={() => router.push(`/dashboard/u/${f.username}`)}
                style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16, padding: "14px 18px", cursor: "pointer" }}
              >
                <Avatar src={f.image} name={f.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(20,19,43,0.45)" }}>@{f.username}</div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        following.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
            <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>Not following anyone yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {following.map((f) => (
              <div
                key={f.id}
                onClick={() => router.push(`/dashboard/u/${f.username}`)}
                style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid rgba(15,23,42,0.07)", borderRadius: 16, padding: "14px 18px", cursor: "pointer" }}
              >
                <Avatar src={f.image} name={f.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#14132B" }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(20,19,43,0.45)" }}>@{f.username}</div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}