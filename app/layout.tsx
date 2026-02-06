import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElderCare Connect",
  description: "Senior care platform connecting families with service providers",
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
