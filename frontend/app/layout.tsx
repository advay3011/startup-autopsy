import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StartupAutopsy — Learn Finance by Destroying Companies",
  description:
    "Play as the CEO of real failed startups. Make the same financial decisions. Watch the consequences unfold. Built for Hackonomics 2026.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-[#144058] text-white font-sans antialiased min-h-screen"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
