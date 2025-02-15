import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "CookieCMS",
  description: "CookieCMS | Minecraft",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased relative min-h-screen">
        {children}
        <Toaster position="top-right" />
        <div className="absolute bottom-2 right-2 text-gray-500 text-sm text-center w-full pb-2">
          © {new Date().getFullYear()} CookieCMS. All rights reserved.  
          <br />
          Original rights belong to Mojang AB.
        </div>
      </body>
    </html>
  );
}
