import Link from "next/link";
import { Brain, Lightbulb, Bug, BookOpen, BarChart3, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Lightbulb,
    title: "Progressive Hints",
    desc: "3-tier hint system that nudges without spoiling. You learn, not just copy.",
  },
  {
    icon: Bug,
    title: "AI Debugger",
    desc: "Paste your code, get a root-cause diagnosis and a one-fix-at-a-time repair guide.",
  },
  {
    icon: BookOpen,
    title: "Second Brain",
    desc: "Auto-generated notebook entries for every solved problem. Search by tag anytime.",
  },
  {
    icon: BarChart3,
    title: "Weakness Heatmap",
    desc: "Track proficiency across DSA topics. Know exactly where to improve.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--card-border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold">Codinyx</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-sm font-medium transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--card-border)] bg-[var(--card)] text-xs text-[var(--muted)] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          Powered by Gemini AI
        </div>

        <h1 className="text-5xl font-black tracking-tight max-w-2xl leading-tight">
          Learn DSA the{" "}
          <span className="text-[var(--accent)]">right way</span>
        </h1>
        <p className="mt-5 text-lg text-[var(--muted)] max-w-xl leading-relaxed">
          Progressive hints, step-by-step debugging, and a personal knowledge base —
          without ever giving you the answer before you&apos;ve thought it through.
        </p>

        <div className="flex items-center gap-3 mt-8">
          <Link
            href="/register"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold transition-colors"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl border border-[var(--card-border)] hover:bg-white/5 text-sm font-medium transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Features grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 text-left hover:border-[var(--primary)]/40 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <p className="font-semibold text-sm mb-1">{title}</p>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-[var(--muted)] border-t border-[var(--card-border)]">
        Codinyx — AI-powered DSA mentor
      </footer>
    </div>
  );
}
