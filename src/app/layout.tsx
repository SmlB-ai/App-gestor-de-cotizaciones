import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GestorPro - Gestión de Materiales y Clientes",
  description: "App profesional para gestión de materiales, clientes y cotizaciones",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50`}
      >
        <div className="flex h-full overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto relative bg-zinc-50 dark:bg-zinc-950">
            <div className="h-full px-8 py-8">
              <div className="max-w-7xl mx-auto h-full">
                {children}
              </div>
            </div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
