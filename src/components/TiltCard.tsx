"use client";

export default function TiltCard({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  intensity?: number;
  glow?: string;
}) {
  return (
    <div
      className={className}
      style={{
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(15,23,42,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,23,42,0.04)";
      }}
    >
      {children}
    </div>
  );
}