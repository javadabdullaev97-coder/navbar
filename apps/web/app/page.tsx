import { t } from "@navbar/core";
import { supabaseConfigured } from "@/lib/supabase";

// Стартовая страница монорепо. Демонстрирует, что apps/web реально
// потребляет @navbar/core (общий TS-core). Тонкий срез (публичная запись
// из Supabase) подключится, когда появятся env реального проекта.
export default function Home() {
  return (
    <main className="wrap">
      <div className="logo">
        nav<span>bar</span>
      </div>
      <h1>{t("en", "book")} — monorepo scaffold</h1>
      <p className="muted">
        React + React Native (Expo) monorepo with a shared TypeScript core
        (<code>@navbar/core</code>). This page renders a string from the core
        i18n dictionary to prove the wiring works.
      </p>

      <div className="card">
        <strong>Core wired ✓</strong>
        <p className="muted" style={{ marginTop: 8 }}>
          en: {t("en", "services")} · ru: {t("ru", "services")} · uz:{" "}
          {t("uz", "services")}
        </p>
      </div>

      <div className="card">
        <strong>Supabase</strong>
        <p className="muted" style={{ marginTop: 8 }}>
          {supabaseConfigured
            ? "Connected — env present."
            : "Not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and _ANON_KEY to .env.local."}
        </p>
      </div>

      <span className="pill">Wave 0 · thin slice next</span>
    </main>
  );
}
