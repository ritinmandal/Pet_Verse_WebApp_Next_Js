
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DeleteProfilePage() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleDelete = async () => {
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) throw new Error("Not logged in");

      const res = await fetch("/api/profile/delete", { method: "POST" });
      const body = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !body.ok) {
        throw new Error(body.error || "Delete failed");
      }

      setMsg("Your profile was deleted.");
      await supabase.auth.signOut();
      router.replace("/");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
     

    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl border p-6 shadow bg-white">
        <h1 className="text-xl font-semibold text-red-600">Delete Profile</h1>
        <p className="text-sm text-gray-600 mt-2">
          This deletes <b>your row</b> from <code>public.users</code>. Your <code>auth.users</code> login stays intact.
        </p>

        <label className="flex items-center gap-2 mt-4 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          I understand this action is permanent for my profile row.
        </label>

        {err && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
            {err}
          </div>
        )}
        {msg && (
          <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
            {msg}
          </div>
        )}

        <button
          onClick={handleDelete}
          disabled={!confirmed || loading}
          className={`mt-4 w-full py-2 rounded-lg text-white ${
            !confirmed || loading ? "bg-red-300 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {loading ? "Deleting…" : "Delete my profile"}
        </button>

        <button
          onClick={() => router.back()}
          className="mt-2 w-full py-2 rounded-lg border text-gray-700 bg-gray-50 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </main>


  );
}
