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
        <nav className="flex items-center gap-6 text-sm text-slate-600">
          <Link href="/setup" className="hover:text-slate-900 transition">New session</Link>
          <a
            href="https://docs.anthropic.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-900 transition"
          >
            Docs
          </a>
        </nav>
      </div>
    </header>
  );
}
