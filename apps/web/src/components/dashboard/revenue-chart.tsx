"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

const defaultData = [
  { day: "Mon", revenue: 28400, target: 25000 },
  { day: "Tue", revenue: 31200, target: 25000 },
  { day: "Wed", revenue: 27800, target: 25000 },
  { day: "Thu", revenue: 34100, target: 25000 },
  { day: "Fri", revenue: 41200, target: 25000 },
  { day: "Sat", revenue: 18900, target: 25000 },
  { day: "Sun", revenue: 22100, target: 25000 },
];

export function RevenueChart({
  data = defaultData,
  wowDelta = "+18%",
}: {
  data?: typeof defaultData;
  wowDelta?: string;
}) {
  return (
    <div className="panel-card p-6 lg:col-span-2">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-[var(--lp-text-primary)]">
            Revenue This Week
          </h3>
          <p className="mt-0.5 text-[13px] text-[var(--lp-text-tertiary)]">
            Daily gross vs $25K target
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-[var(--lp-green-dim)] px-3 py-1">
          <TrendingUp className="h-3 w-3 text-brand-green" />
          <span className="text-xs font-semibold text-brand-green">{wowDelta} WoW</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,163,204,0.08)" />
          <XAxis
            dataKey="day"
            tick={{ fill: "#5270A0", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#5270A0", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "#132042",
              border: "1px solid rgba(139,163,204,0.15)",
              borderRadius: 8,
              color: "#F0F4FF",
              fontSize: 12,
            }}
            formatter={(val) => [
              `$${Number(val ?? 0).toLocaleString()}`,
              "",
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#revGrad)"
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke="rgba(139,163,204,0.3)"
            strokeWidth={1}
            strokeDasharray="4 4"
            fill="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
