"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await createClient().auth.signOut();
    window.location.assign("/login");
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="mt-6 w-full rounded-lg border border-slate-700 px-3 py-2 text-left text-sm text-slate-400 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:opacity-60"
    >
      {loading ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}
