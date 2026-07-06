"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";

// Вход мастера по email-ссылке (magic link). Телефонный OTP — этап интеграций.
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const sb = supabaseClient();
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="wrap">
      <div className="logo">
        nav<span>bar</span>
      </div>
      <h1>Вход для мастера</h1>
      {sent ? (
        <div className="card">
          <strong>Ссылка отправлена</strong>
          <p className="muted" style={{ marginTop: 8 }}>
            Проверьте почту {email} и откройте ссылку для входа.
          </p>
        </div>
      ) : (
        <form onSubmit={submit}>
          <p className="muted" style={{ marginBottom: 16 }}>
            Отправим ссылку для входа на email. Вход по номеру телефона —
            появится позже.
          </p>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <div className="err">{error}</div>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Отправляем…" : "Получить ссылку"}
          </button>
        </form>
      )}
    </main>
  );
}
