import Link from "next/link";
import {
  Zap,
  Mail,
  FileCheck,
  Plus,
  ArrowRight,
  Sparkles,
  MapPin,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadOfferCards } from "@/components/booking/load-offer-cards";
import { fetchBookingQueue } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

function getBrokerName(
  brokers: { name: string } | { name: string }[] | null | undefined
) {
  if (!brokers) return null;
  return Array.isArray(brokers) ? brokers[0]?.name : brokers.name;
}

const bookingChannels = [
  {
    icon: Mail,
    title: "Email Parser",
    description: "Paste broker emails — AI extracts lane, rate, and dates.",
    href: "/dashboard/email-parser",
    cta: "Parse email",
  },
  {
    icon: FileCheck,
    title: "Rate Con Parser",
    description: "Upload rate confirmations for instant load creation.",
    href: "/dashboard/rate-confirmation",
    cta: "Upload rate con",
  },
  {
    icon: Plus,
    title: "Manual Entry",
    description: "Create a load from scratch when you have all details.",
    href: "/dashboard/loads/new",
    cta: "New load",
  },
];

export default async function BookingCenterPage() {
  const { availableLoads, recentBooked, bookedCount } =
    await fetchBookingQueue();

  const readyCount = availableLoads.length;

  return (
    <div>
      <PageHeader
        title="Load Booking Center"
        description="AI-ranked loads matched to your equipment and lane history"
        action={
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-lg border border-brand-green/20 bg-[var(--lp-green-dim)] px-3 py-1.5 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
              <span className="text-[13px] font-semibold text-brand-green">
                Live — {readyCount || 0} offers ready
              </span>
            </div>
            <Link href="/dashboard/loads/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Book load
              </Button>
            </Link>
          </div>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Ready to book</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {readyCount}
          </p>
          <p className="mt-1 text-xs font-medium text-brand-green">
            AI-parsed offers
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Active bookings</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {bookedCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">Booked &amp; in transit</p>
        </Card>
        <Card className="border-brand-green/30 bg-[var(--lp-green-dim)]">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-green" />
            <p className="text-sm font-medium text-brand-green">AI booking</p>
          </div>
          <p className="mt-2 text-sm text-[var(--lp-text-secondary)]">
            Paste a broker email or upload a rate con to auto-create loads.
          </p>
        </Card>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {bookingChannels.map((channel) => {
          const Icon = channel.icon;
          return (
            <Link key={channel.title} href={channel.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                  <Icon className="h-5 w-5 text-slate-600" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">
                  {channel.title}
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {channel.description}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-accent">
                  {channel.cta}
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </span>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl border border-[var(--lp-border)]">
        <LoadOfferCards loads={availableLoads} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-slate-500" />
            <CardTitle className="text-slate-900">Recently booked</CardTitle>
          </div>
          <Badge status="processing" label={`${recentBooked.length} recent`} />
        </CardHeader>
        {recentBooked.length ? (
          <div className="space-y-2">
            {recentBooked.map((load) => (
              <Link
                key={load.id}
                href={`/dashboard/loads/${load.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--lp-blue-dim)]">
                    <MapPin className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {load.load_number ?? load.id.slice(0, 8)}
                      {getBrokerName(load.brokers) && (
                        <span className="ml-2 text-sm font-normal text-slate-400">
                          via {getBrokerName(load.brokers)}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(load.pickup_date)}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-brand-green">
                  {formatCurrency(load.rate)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Booked loads will appear here.</p>
        )}
      </Card>
    </div>
  );
}
