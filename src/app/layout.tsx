import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Peniel Baptist Church – Hakha",
  description: "Official website of Peniel Baptist Church, Hakha, Chin State.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-64.png" type="image/png" sizes="64x64" />
        <link rel="shortcut icon" href="/favicon-64.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon-64.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
