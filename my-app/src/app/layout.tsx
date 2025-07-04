import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dev Blog",
  description: "Generated by create next app",
  icons: {
    icon: "/logo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
