import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AccountBlockedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  if (status !== "SUSPENDED" && status !== "DELETED") {
    redirect("/dashboard");
  }

  const isDeleted = status === "DELETED";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F5FB", fontFamily: "'Inter', sans-serif", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 40, maxWidth: 440, textAlign: "center", boxShadow: "0 20px 50px rgba(20,19,43,0.1)" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            margin: "0 auto 20px",
            background: isDeleted ? "rgba(220,38,38,0.1)" : "rgba(245,158,11,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
          }}
        >
          {isDeleted ? "🚫" : "⏸️"}
        </div>

        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 21, fontWeight: 700, color: "#14132B", marginBottom: 10 }}>
          {isDeleted ? "This account has been permanently removed" : "This account is temporarily on hold"}
        </h1>

        <p style={{ fontSize: 14, color: "rgba(20,19,43,0.6)", lineHeight: 1.6, marginBottom: 20 }}>
          {isDeleted
            ? "This account was removed by an administrator and can no longer be accessed. If you'd like to continue using SECM, please create a new account with a different email address."
            : "An administrator has placed a temporary hold on this account. To resolve this and regain access, please contact support."}
        </p>

        <div style={{ background: "#F6F5FB", borderRadius: 12, padding: "12px 16px", marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: "rgba(20,19,43,0.5)", marginBottom: 4 }}>Contact support:</p>
          <a href="mailto:help.secm@gmail.com" style={{ fontSize: 14, fontWeight: 700, color: "#6D4AFF", textDecoration: "none" }}>
            help.secm@gmail.com
          </a>
        </div>

        {isDeleted ? (
          <Link
            href="/register"
            style={{ display: "inline-block", background: "linear-gradient(135deg,#6D4AFF,#8B5CF6)", color: "#fff", textDecoration: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 700 }}
          >
            Create a new account
          </Link>
        ) : (
          <Link
            href="/login"
            style={{ display: "inline-block", background: "rgba(20,19,43,0.05)", color: "#14132B", textDecoration: "none", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 700 }}
          >
            Back to login
          </Link>
        )}
      </div>
    </div>
  );
}