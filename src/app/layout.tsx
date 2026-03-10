import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Free Debt Assessment",
  description: "Get a free, no-obligation assessment of your debt situation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
