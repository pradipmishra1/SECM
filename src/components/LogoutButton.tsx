"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        border: "1px solid rgba(0,0,0,0.1)",
        background: "#fff",
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      Log out
    </button>
  );
}