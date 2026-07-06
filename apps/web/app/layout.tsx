import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Navbar — online booking",
  description: "Online booking for beauty & service masters.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
