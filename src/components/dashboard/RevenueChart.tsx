"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatBRL } from "@/lib/calc";

export function RevenueChart({
  data,
}: {
  data: { date: string; receita: number; lucro: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="receita" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lucro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => d.slice(8, 10) + "/" + d.slice(5, 7)}
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v: number) => `R$${Math.round(v / 1)}`}
        />
        <Tooltip
          formatter={(value) => formatBRL(Number(value))}
          labelFormatter={(d) => new Date(String(d)).toLocaleDateString("pt-BR")}
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Area type="monotone" dataKey="receita" name="Receita" stroke="var(--brand)" fill="url(#receita)" strokeWidth={2} />
        <Area type="monotone" dataKey="lucro" name="Lucro" stroke="var(--accent)" fill="url(#lucro)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
