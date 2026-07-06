import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { cssVars, dark, light } from "@navbar/core";
import "./globals.css";
import SiteHeader from "./SiteHeader";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--f-display",
});
const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--f-body",
});

export const metadata: Metadata = {
  title: "Navbar — онлайн-запись к мастерам",
  description: "Барберы и мастера красоты. Запись онлайн.",
};

// Токены темы из @navbar/core — единый источник для web и mobile.
const themeCss = `:root{${cssVars(light)}}
:root[data-theme="dark"]{${cssVars(dark)}}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${cssVars(dark)}}}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${fraunces.variable} ${manrope.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        {/* Тема из localStorage до отрисовки — без мигания */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
