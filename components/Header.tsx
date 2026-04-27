import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-soft group-hover:scale-105 transition">
            IS
          </span>
          <span className="font-semibold text-slate-900">Interview Simulator</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/history"
            className="rounded-lg px-3 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            History
          </Link>
          <Link
            href="/setup"
            className="rounded-lg bg-brand-600 px-3 py-1.5 font-semibold text-white hover:bg-brand-700 transition"
          >
            New session
          </Link>
        </nav>
      </div>
    </header>
  );
}
