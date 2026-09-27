"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function Avatar({ src, name, size = 46 }: { src?: string | null; name: string; size?: number }) {
  return src ? (
    <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #fff", boxShadow: "0 2px 8px rgba(20,19,43,0.1)" }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.4, flexShrink: 0, border: "2px solid #fff", boxShadow: "0 2px 8px rgba(20,19,43,0.1)" }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

function PersonCard({
  person,
  variant,
  onMessage,
  onView,
}: {
  person: any;
  variant: "friend" | "follower" | "following";
  onMessage?: () => void;
  onView: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="pc-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "#fff",
        border: "1px solid rgba(15,23,42,0.07)",
        borderRadius: 18,
        padding: "16px 18px",
        position: "relative",
      }}
    >
      <div style={{ position: "relative" }}>
        <Avatar src={person.image} name={person.name} />
        {person.online && (
          <span style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: "#22C55E", border: "2px solid #fff" }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={onView}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: "#14132B" }}>{person.name}</span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(20,19,43,0.4)", marginTop: 1 }}>@{person.username}</div>
        {person.mutualChallenge && (
          <div style={{ fontSize: 12, color: "rgba(20,19,43,0.55)", marginTop: 4 }}>
            Mutual Challenge: <span style={{ fontWeight: 600, color: "#6D4AFF" }}>{person.mutualChallenge}</span>
          </div>
        )}
        {person.lastActiveLabel && (
          <div style={{ fontSize: 11.5, color: "rgba(20,19,43,0.35)", marginTop: 2 }}>{person.lastActiveLabel}</div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {variant === "friend" && (
          <button className="pc-btn-primary" onClick={onMessage} style={{ background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
            Message
          </button>
        )}
        <button className="pc-btn-secondary" onClick={onView} style={{ background: "#fff", color: "#14132B", border: "1px solid rgba(15,23,42,0.12)", borderRadius: 10, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
          View Profile
        </button>
        <div style={{ position: "relative" }}>
          <button
            className="pc-btn-more"
            onClick={() => setMenuOpen((v) => !v)}
            style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid rgba(15,23,42,0.12)", background: "#fff", cursor: "pointer", fontSize: 16, color: "rgba(20,19,43,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            ⋯
          </button>
          {menuOpen && (
            <div
              className="pc-menu"
              style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 20, background: "#fff", borderRadius: 12, border: "1px solid rgba(20,19,43,0.08)", boxShadow: "0 12px 28px rgba(20,19,43,0.14)", minWidth: 150, overflow: "hidden" }}
            >
              <button
                onClick={() => { setMenuOpen(false); onView(); }}
                style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: "transparent", fontSize: 12.5, fontWeight: 600, color: "#14132B", cursor: "pointer" }}
              >
                View Profile
              </button>
              <button
                onClick={() => setMenuOpen(false)}
                style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", borderTop: "1px solid rgba(20,19,43,0.06)", background: "transparent", fontSize: 12.5, fontWeight: 600, color: "#DC2626", cursor: "pointer" }}
              >
                {variant === "following" ? "Unfollow" : variant === "follower" ? "Remove Follower" : "Unfriend"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FriendsManager({ initialTab }: { initialTab?: "friends" | "followers" | "following" }) {
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"friends" | "followers" | "following">(initialTab || "friends");

  function load() {
    fetch("/api/friends")
      .then((r) => r.json())
      .then((d) => {
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

  const list = tab === "friends" ? friends : tab === "followers" ? followers : following;
  const emptyText =
    tab === "friends" ? "No friends yet." : tab === "followers" ? "No followers yet." : "Not following anyone yet.";

  return (
    <div>
      <style>{`
        @keyframes fmRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fm-tab { transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease; }
        .fm-tab:hover { transform: translateY(-1px); }
        .fm-tab:active { transform: scale(0.96); }
        .pc-card { transition: box-shadow 0.25s ease, transform 0.25s cubic-bezier(.2,.8,.2,1), border-color 0.25s ease; animation: fmRise 0.4s cubic-bezier(.2,.8,.2,1) both; }
        .pc-card:hover { box-shadow: 0 14px 32px rgba(20,19,43,0.09); transform: translateY(-2px); border-color: rgba(109,74,255,0.15) !important; }
        .pc-btn-primary { transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease; }
        .pc-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(109,74,255,0.3); }
        .pc-btn-primary:active { transform: translateY(0) scale(0.96); }
        .pc-btn-secondary { transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease; }
        .pc-btn-secondary:hover { background: rgba(109,74,255,0.05); border-color: rgba(109,74,255,0.25) !important; }
        .pc-btn-secondary:active { transform: scale(0.96); }
        .pc-btn-more { transition: background 0.18s ease, transform 0.18s ease; }
        .pc-btn-more:hover { background: rgba(20,19,43,0.04); }
        .pc-btn-more:active { transform: scale(0.9); }
        .pc-menu { animation: fmFadeIn 0.15s ease both; }
        .fm-empty { animation: fmFadeIn 0.4s ease both; }
      `}</style>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { key: "friends", label: `Friends (${friends.length})` },
          { key: "followers", label: `Followers (${followers.length})` },
          { key: "following", label: `Following (${following.length})` },
        ].map((t) => (
          <button
            key={t.key}
            className="fm-tab"
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
              boxShadow: tab === t.key ? "0 6px 16px rgba(109,74,255,0.25)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: "rgba(20,19,43,0.4)" }}>Loading...</p>
      ) : list.length === 0 ? (
        <div className="fm-empty" style={{ background: "#fff", borderRadius: 18, border: "1px solid rgba(15,23,42,0.07)", padding: 50, textAlign: "center" }}>
          <p style={{ color: "rgba(20,19,43,0.4)", fontSize: 14 }}>{emptyText}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((f, i) => (
            <div key={f.id} style={{ animationDelay: `${i * 0.05}s` }}>
              <PersonCard
                person={f}
                variant={tab === "friends" ? "friend" : tab === "followers" ? "follower" : "following"}
                onMessage={() => router.push(`/dashboard/messages?to=${f.username}`)}
                onView={() => router.push(`/dashboard/u/${f.username}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}