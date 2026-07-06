"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { applyTheme, getRole, getTheme, setRole, type RolePref, type ThemePref } from "@/lib/prefs";
import { AutoIcon, MoonIcon, SlidersIcon, SunIcon } from "./Icons";

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

  const ThemeIcon = theme === "light" ? SunIcon : theme === "dark" ? MoonIcon : AutoIcon;

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
          <Link href={role === "client" ? "/me" : "/dashboard"} className="nav-link">
            {role === "client" ? "Мои записи" : "Кабинет"}
          </Link>
          <button className="icon-btn" onClick={cycleTheme} title="Тема" aria-label="Сменить тему">
            <ThemeIcon />
          </button>
          <Link href="/settings" className="icon-btn" title="Настройки" aria-label="Настройки">
            <SlidersIcon />
          </Link>
        </div>
      </div>
    </header>
  );
}
