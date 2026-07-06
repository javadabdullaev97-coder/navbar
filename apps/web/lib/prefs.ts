"use client";
// Клиентские предпочтения в localStorage: тема и активная роль.
// (До полноценного аккаунта — локально; позже переносим на бэкенд.)

export type ThemePref = "light" | "dark" | "system";
export type RolePref = "client" | "master";

export function getTheme(): ThemePref {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as ThemePref) || "system";
}

export function applyTheme(t: ThemePref) {
  const root = document.documentElement;
  if (t === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", t);
  localStorage.setItem("theme", t);
}

export function getRole(): RolePref {
  if (typeof window === "undefined") return "client";
  return (localStorage.getItem("role") as RolePref) || "client";
}

export function setRole(r: RolePref) {
  localStorage.setItem("role", r);
}
