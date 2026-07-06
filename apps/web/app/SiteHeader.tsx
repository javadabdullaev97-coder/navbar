"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { applyTheme, getRole, getTheme, setRole, type RolePref, type ThemePref } from "@/lib/prefs";

export default function SiteHeader() {
  const router = useRouter();
  const [role, setRoleState] = useState<RolePref>("client");
  const [theme, setTheme] = useState<ThemePref>("system");

  useEffect(() => {
    setRoleState(getRole());
    setTheme(getTheme());
  }, []);

  function switchRole(r: RolePref) {
    setRole(r);
    setRoleState(r);
    router.push(r === "master" ? "/dashboard" : "/");
  }

  function cycleTheme() {
    const next: ThemePref = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    applyTheme(next);
  }

  const themeIcon = theme === "light" ? "☀" : theme === "dark" ? "☾" : "◐";

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          nav<span>bar</span>
        </Link>

        <div className="site-nav">
          <div className="role-toggle">
            <button className={role === "client" ? "on" : ""} onClick={() => switchRole("client")}>Клиент</button>
            <button className={role === "master" ? "on" : ""} onClick={() => switchRole("master")}>Мастер</button>
          </div>
          {role === "client" ? (
            <Link href="/me" className="nav-link">Мои записи</Link>
          ) : (
            <Link href="/dashboard" className="nav-link">Кабинет</Link>
          )}
          <button className="icon-btn" onClick={cycleTheme} title="Тема" aria-label="Тема">{themeIcon}</button>
          <Link href="/settings" className="icon-btn" title="Настройки" aria-label="Настройки">⚙</Link>
        </div>
      </div>
    </header>
  );
}
