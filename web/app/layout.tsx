import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Navbar — онлайн-запись к мастеру",
  description:
    "Онлайн-запись клиентов к барберам и мастерам красоты. Узбекистан.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
