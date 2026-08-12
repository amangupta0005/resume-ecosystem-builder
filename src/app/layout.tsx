import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { FolderGit2 } from "lucide-react";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Resume Ecosystem Builder",
  description: "Manage projects, bullet overrides, and domain-targeted resume configs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 text-slate-900 antialiased font-[family-name:var(--font-geist-sans)]`}
      >
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 font-semibold text-slate-950 transition hover:opacity-80"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">
                <FolderGit2 size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">Resume Ecosystem</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Project Manager</span>
              </div>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Projects
              </Link>
              <Link
                href="/resumes"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Domain Resumes
              </Link>
              <Link
                href="/resumes/compare"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Compare Matrix
              </Link>
              <Link
                href="/profile"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Profile & Bio
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}

