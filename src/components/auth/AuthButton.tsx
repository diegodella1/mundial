"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, [supabase]);

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/api/auth/callback",
      },
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
      >
        Iniciar sesión con Google
      </button>
    );
  }

  const avatar = user.user_metadata?.avatar_url;
  const name =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email;

  return (
    <div className="flex items-center gap-3">
      {avatar && (
        <img
          src={avatar}
          alt=""
          className="h-8 w-8 rounded-full"
          referrerPolicy="no-referrer"
        />
      )}
      <span className="text-sm text-white">{name}</span>
      <button
        onClick={handleSignOut}
        className="rounded-lg bg-zinc-700 px-3 py-1.5 text-sm text-white transition hover:bg-zinc-600"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
