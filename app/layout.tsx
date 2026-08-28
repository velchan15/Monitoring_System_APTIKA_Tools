import type { Metadata } from "next";
import "./globals.css";

// Font-stack didefinisikan langsung di tailwind.config.ts (bukan next/font/google),
// supaya production build tidak bergantung pada akses internet ke Google Fonts saat
// di-build — penting kalau build dijalankan di jaringan internal yang dibatasi.
export const metadata: Metadata = {
  title: "Monitoring System — APTIKA",
  description: "Dashboard pemantauan aplikasi APTIKA, Diskominfo Jawa Barat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
