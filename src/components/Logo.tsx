"use client";

import Image from "next/image";

export function LogoMark({ size = 36 }: { size?: number; color?: string }) {
  return (
    <Image
      src="/brand/logo.png"
      alt="SECM logo"
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: "contain" }}
      priority
    />
  );
}

export function LogoWordmark({
  size = "md",
  showTagline = true,
  color = "#14132B",
  taglineColor = "rgba(20,19,43,0.45)",
  animated = false,
}: {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  color?: string;
  taglineColor?: string;
  animated?: boolean;
}) {
  const iconSize = size === "sm" ? 28 : size === "lg" ? 56 : 36;
  const nameSize = size === "sm" ? 15 : size === "lg" ? 34 : 19;
  const tagSize = size === "sm" ? 9 : size === "lg" ? 13 : 10.5;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: size === "lg" ? 16 : 10 }} className={animated ? "logo-anim" : undefined}>
      {animated && (
        <style>{`
          @keyframes logoMarkIn { from { opacity:0; transform: scale(0.7) rotate(-15deg); } to { opacity:1; transform: scale(1) rotate(0deg); } }
          @keyframes logoTextIn { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: translateX(0); } }
          .logo-anim .logo-mark-wrap { animation: logoMarkIn 0.6s cubic-bezier(.2,.8,.2,1) both; }
          .logo-anim .logo-text-wrap { animation: logoTextIn 0.6s cubic-bezier(.2,.8,.2,1) 0.15s both; }
        `}</style>
      )}
      <div className={animated ? "logo-mark-wrap" : undefined}>
        <LogoMark size={iconSize} />
      </div>
      <div className={animated ? "logo-text-wrap" : undefined}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: nameSize, color, letterSpacing: 1, lineHeight: 1 }}>
          SECM
        </div>
        {showTagline && (
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: tagSize, color: taglineColor, letterSpacing: 0.6, lineHeight: 1.3, marginTop: size === "lg" ? 4 : 2 }}>
            Skill, Experience & Contest Marketplace
          </div>
        )}
      </div>
    </div>
  );
}