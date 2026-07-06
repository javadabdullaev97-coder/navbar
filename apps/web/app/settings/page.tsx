"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { applyTheme, getRole, getTheme, setRole, type RolePref, type ThemePref } from "@/lib/prefs";
import { supabaseClient } from "@/lib/supabase-client";

const THEMES: [ThemePref, string][] = [["light", "Светлая"], ["dark", "Тёмная"], ["system", "Как в системе"]];
const LANGS: [string, string][] = [["ru", "Русский"], ["uz", "O'zbekcha"], ["en", "English"]];

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemePref>("system");
  const [role, setRoleState] = useState<RolePref>("client");
  const [lang, setLang] = useState("ru");

  useEffect(() => {
    setTheme(getTheme());
    setRoleState(getRole());
    setLang(localStorage.getItem("lang") || "ru");
  }, []);

  function pickTheme(t: ThemePref) {
    setTheme(t);
    applyTheme(t);
  }
  function switchRole(r: RolePref) {
    setRole(r);
    setRoleState(r);
    router.push(r === "master" ? "/dashboard" : "/");
  }
  async function logout() {
    await supabaseClient().auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="narrow">
      <h1>Настройки</h1>

      <div className="section">Тема</div>
      <div className="seg">
        {THEMES.map(([t, label]) => (
          <button key={t} className={theme === t ? "on" : ""} onClick={() => pickTheme(t)}>{label}</button>
        ))}
      </div>

      <div className="section">Роль</div>
      <p className="muted" style={{ marginBottom: 10 }}>Переключайтесь между интерфейсом клиента и мастера без выхода.</p>
      <div className="seg">
        <button className={role === "client" ? "on" : ""} onClick={() => switchRole("client")}>Клиент</button>
        <button className={role === "master" ? "on" : ""} onClick={() => switchRole("master")}>Мастер</button>
      </div>

      <div className="section">Язык</div>
      <select className="input" value={lang} onChange={(e) => { setLang(e.target.value); localStorage.setItem("lang", e.target.value); }}>
        {LANGS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
      </select>
      <p className="muted" style={{ fontSize: 13 }}>Перевод интерфейса — на этапе локализации.</p>

      <div className="section">Аккаунт</div>
      <button className="linkbtn" onClick={logout}>Выйти</button>
    </main>
  );
}
