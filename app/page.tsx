import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="space-y-16">
      <section className="text-center pt-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 text-brand-700 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider">
          Powered by Claude
        </div>
        <h1 className="mt-5 text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
          Practice interviews that
          <br />
          actually <span className="text-brand-600">prepare</span> you.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed">
          Realistic behavioral, case, and situational questions tailored to your background and the exact role
          you're targeting. Get instant STAR-framework feedback on every answer.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/setup"
            className="rounded-xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-soft hover:bg-brand-700 transition"
          >
            Start practicing
          </Link>
          <a
            href="#features"
            className="rounded-xl bg-white border border-slate-200 px-7 py-3.5 text-base font-semibold text-slate-700 hover:border-slate-300 transition"
          >
            Learn more
          </a>
        </div>
      </section>

      <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Tailored to your role",
            body: "Paste a job description or URL. Every question is calibrated to the responsibilities, seniority, and industry you care about.",
          },
          {
            title: "STAR-framework feedback",
            body: "For each behavioral answer, get a breakdown of Situation, Task, Action, and Result — plus a suggested revision that would score higher.",
          },
          {
            title: "Two answer modes",
            body: "Write a full response, or choose from multiple-choice options when you want a quick sanity check on your instincts.",
          },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl bg-white shadow-soft border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-white text-center">
        <h2 className="text-2xl font-semibold">Ready for your next interview?</h2>
        <p className="mt-2 text-brand-100">Set up your profile in under a minute.</p>
        <Link
          href="/setup"
          className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition"
        >
          Begin practice session →
        </Link>
      </section>
    </div>
  );
}
