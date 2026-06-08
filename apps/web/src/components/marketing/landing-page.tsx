"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Zap,
  FileText,
  DollarSign,
  Clock,
  ChevronRight,
  CheckCircle,
  Star,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Product", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Carriers", href: "#testimonials" },
  { label: "Brokers", href: "#platform" },
  { label: "Company", href: "#platform" },
];

const stats = [
  { value: "$2.4M", label: "Revenue recovered", sub: "avg per fleet annually" },
  { value: "94%", label: "Detention captured", sub: "vs 41% industry avg" },
  { value: "8 min", label: "Avg booking time", sub: "down from 47 min" },
  { value: "12,400+", label: "Active drivers", sub: "across all fleet sizes" },
];

const features = [
  {
    icon: Zap,
    title: "Automated Freight Booking",
    desc: "AI-powered load matching across DAT, Truckstop, and 200+ broker portals. Book loads in minutes, not hours.",
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.12)",
  },
  {
    icon: FileText,
    title: "AI Document Organization",
    desc: "Automatically classify, extract, and file BOLs, PODs, rate confirmations, and permits. Zero manual filing.",
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.12)",
  },
  {
    icon: DollarSign,
    title: "Revenue Recovery",
    desc: "Catch every accessorial charge. Our AI flags underpayments, shortages, and missed line items before invoicing.",
    color: "#16C784",
    bg: "rgba(22, 199, 132, 0.12)",
  },
  {
    icon: Clock,
    title: "Detention Tracking",
    desc: "Real-time detention clock with automatic notifications to brokers and shippers. Never lose a detention claim.",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.12)",
  },
];

const testimonials = [
  {
    quote:
      "LaneOS recovered $148,000 in missed detention and accessorials our first year. It paid for itself in three weeks.",
    name: "Marcus T.",
    role: "Owner Operator, Memphis TN",
    trucks: "1 truck",
    avatar: "MT",
  },
  {
    quote:
      "Managing 22 drivers used to require 3 dispatchers. Now two of us run the whole operation more efficiently than ever.",
    name: "Sarah K.",
    role: "Fleet Manager, Phoenix AZ",
    trucks: "22 trucks",
    avatar: "SK",
  },
  {
    quote:
      "The document center alone saved us from a $60K audit penalty. Every BOL and POD automatically organized.",
    name: "James R.",
    role: "Dispatcher, Chicago IL",
    trucks: "8 trucks",
    avatar: "JR",
  },
];

const plans = [
  {
    name: "Solo",
    price: "$79",
    period: "/mo",
    desc: "Perfect for owner operators running 1–2 trucks",
    features: [
      "Automated load booking",
      "Document center",
      "Detention tracking",
      "Revenue recovery alerts",
      "Mobile app",
    ],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Fleet",
    price: "$299",
    period: "/mo",
    desc: "For small fleets up to 15 trucks",
    features: [
      "Everything in Solo",
      "Multi-driver dispatch",
      "Broker relationships",
      "Advanced analytics",
      "Priority support",
      "API access",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For fleets 15+ trucks and brokerages",
    features: [
      "Everything in Fleet",
      "Dedicated success manager",
      "Custom integrations",
      "White-label options",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export function LandingPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-[var(--lp-navy-dark)] text-[var(--lp-text-primary)]">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--lp-border)] bg-[rgba(11,22,41,0.92)] px-8 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Truck className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Lane<span className="text-accent">OS</span>
          </span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-[var(--lp-text-secondary)] transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="accent" size="sm">
              Get started free
            </Button>
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-5xl px-8 pb-20 pt-24 text-center">
        <div className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-[var(--lp-blue-dim)] px-3.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
          <span className="text-[13px] font-medium text-accent">
            Now with AI load negotiation — save avg 12% per load
          </span>
        </div>
        <h1 className="mb-6 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-tight">
          The freight OS for
          <br />
          <span className="text-accent">serious carriers</span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-[1.1rem] leading-relaxed text-[var(--lp-text-secondary)]">
          Automate booking, capture every dollar, and organize every document —
          from a single platform built for owner operators, small fleets, and
          dispatchers.
        </p>
        <form
          action="/signup"
          className="mx-auto flex max-w-md flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <div className="flex w-full items-center rounded-[10px] border border-[var(--lp-border-bright)] bg-[var(--lp-navy-panel)] sm:w-auto">
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-transparent px-4 py-3 text-[15px] text-white outline-none placeholder:text-[var(--lp-text-tertiary)] sm:w-[260px]"
            />
            <Button type="submit" variant="accent" size="sm" className="m-1 shrink-0">
              Start free — no CC needed
            </Button>
          </div>
        </form>
        <p className="mt-4 text-[13px] text-[var(--lp-text-tertiary)]">
          Free 14-day trial · No credit card · Setup in 5 minutes
        </p>

        <div className="relative mt-16 overflow-hidden rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-navy-mid)]">
          <div className="flex items-center gap-2 border-b border-[var(--lp-border)] bg-[var(--lp-navy-panel)] px-5 py-3">
            {["#EA3943", "#F59E0B", "#16C784"].map((c) => (
              <span
                key={c}
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: c }}
              />
            ))}
            <span className="ml-2 text-xs text-[var(--lp-text-tertiary)]">
              laneos.io/dashboard
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
            {[
              { label: "Active Loads", val: "24", delta: "+3", green: true },
              { label: "Revenue MTD", val: "$187,400", delta: "+18%", green: true },
              { label: "Detention Pending", val: "$4,200", delta: "6 loads", green: false },
              { label: "Docs to Review", val: "3", delta: "2 urgent", green: false },
            ].map((m) => (
              <div key={m.label} className="rounded-xl bg-white px-5 py-4">
                <p className="mb-2 text-xs text-[var(--card-muted)]">{m.label}</p>
                <p className="text-[1.4rem] font-bold tracking-tight text-[var(--lp-navy-dark)]">
                  {m.val}
                </p>
                <p
                  className={`mt-1 flex items-center gap-1 text-xs ${m.green ? "text-brand-green" : "text-amber-500"}`}
                >
                  <TrendingUp className="h-3 w-3" />
                  {m.delta}
                </p>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[var(--lp-navy-mid)]" />
        </div>
      </section>

      <section className="border-y border-[var(--lp-border)] bg-[var(--lp-navy-mid)]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-8 py-12 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[2rem] font-bold tracking-tight text-brand-green">
                {s.value}
              </p>
              <p className="mt-1 text-sm font-medium">{s.label}</p>
              <p className="mt-0.5 text-xs text-[var(--lp-text-tertiary)]">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-5xl px-8 py-24">
        <div className="mb-16 text-center">
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-widest text-accent">
            Platform
          </p>
          <h2 className="text-[2.25rem] font-bold tracking-tight">
            Everything a carrier needs.
            <br />
            Nothing they don&apos;t.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-navy-panel)] p-8 transition-colors hover:border-accent/30"
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: f.bg }}
                >
                  <Icon className="h-[22px] w-[22px]" style={{ color: f.color }} />
                </div>
                <h3 className="mb-3 font-semibold">{f.title}</h3>
                <p className="text-[15px] leading-relaxed text-[var(--lp-text-secondary)]">
                  {f.desc}
                </p>
                <p className="mt-5 flex cursor-pointer items-center gap-1 text-[13px] font-medium text-accent">
                  Learn more <ChevronRight className="h-3.5 w-3.5" />
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="testimonials"
        className="border-y border-[var(--lp-border)] bg-[var(--lp-navy-mid)] py-24"
      >
        <div className="mx-auto max-w-5xl px-8">
          <div className="mb-16 text-center">
            <div className="mb-4 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
              ))}
              <span className="ml-2 text-sm text-[var(--lp-text-secondary)]">
                4.9/5 from 2,400+ reviews
              </span>
            </div>
            <h2 className="text-[2rem] font-bold tracking-tight">
              Carriers that switched never went back
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-[var(--lp-border)] bg-[var(--lp-navy-panel)] p-7"
              >
                <div className="mb-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="mb-5 text-[15px] leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-[var(--lp-text-tertiary)]">
                      {t.role} · {t.trucks}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-8 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-[2rem] font-bold tracking-tight">
            Simple, predictable pricing
          </h2>
          <p className="mt-2 text-[var(--lp-text-secondary)]">
            Start free. Scale as you grow.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl p-8 ${
                p.highlight
                  ? "bg-accent ring-1 ring-accent/40"
                  : "border border-[var(--lp-border)] bg-[var(--lp-navy-panel)]"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-green px-3 py-0.5 text-[11px] font-bold tracking-wide text-white">
                  MOST POPULAR
                </span>
              )}
              <p
                className={`mb-2 text-[13px] font-semibold uppercase tracking-widest ${
                  p.highlight ? "text-white/80" : "text-[var(--lp-text-secondary)]"
                }`}
              >
                {p.name}
              </p>
              <div className="mb-2 flex items-baseline gap-1">
                <span
                  className={`text-[2.25rem] font-bold tracking-tight ${
                    p.highlight ? "text-white" : ""
                  }`}
                >
                  {p.price}
                </span>
                <span
                  className={
                    p.highlight ? "text-white/60" : "text-[var(--lp-text-tertiary)]"
                  }
                >
                  {p.period}
                </span>
              </div>
              <p
                className={`mb-6 text-[13px] ${
                  p.highlight ? "text-white/70" : "text-[var(--lp-text-secondary)]"
                }`}
              >
                {p.desc}
              </p>
              <Link href="/signup" className="mb-6 block">
                <Button
                  variant={p.highlight ? "primary" : "accent"}
                  className="w-full"
                >
                  {p.cta}
                </Button>
              </Link>
              <ul className="flex flex-col gap-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <CheckCircle
                      className={`mt-0.5 h-[15px] w-[15px] shrink-0 ${
                        p.highlight ? "text-white/80" : "text-brand-green"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        p.highlight ? "text-white/85" : "text-[var(--lp-text-secondary)]"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section
        id="platform"
        className="border-t border-[var(--lp-border)] bg-[var(--lp-navy-mid)] px-8 py-24 text-center"
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-[2.25rem] font-bold tracking-tight">
            Ready to take control of your freight?
          </h2>
          <p className="mb-8 text-[1.05rem] text-[var(--lp-text-secondary)]">
            Join 12,400+ carriers who run smarter with LaneOS.
          </p>
          <Link href="/signup">
            <Button variant="accent" size="lg" className="gap-2">
              Get started free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--lp-border)] px-8 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-accent" />
            <span className="text-sm text-[var(--lp-text-secondary)]">
              © {new Date().getFullYear()} LaneOS, Inc. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Security", "Status"].map((l) => (
              <span
                key={l}
                className="cursor-pointer text-[13px] text-[var(--lp-text-tertiary)] transition-colors hover:text-white"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
