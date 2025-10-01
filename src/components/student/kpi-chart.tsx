
"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface KpiChartProps {
  data: { round: number; [key: string]: any }[];
  dataKey: string;
  unit?: string;
}

export function KpiChart({ data, dataKey, unit = "" }: KpiChartProps) {
  return (
    <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart
            data={data}
            margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="round" label={{ value: 'Ronda', position: 'insideBottom', offset: -5 }} />
            <YAxis
            tickFormatter={(value) => `${value}${unit}`}
            label={{ value: `Valor (${unit})`, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
            formatter={(value) => [`${value}${unit}`, "Valor"]}
            labelFormatter={(label) => `Ronda ${label}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Line
            type="monotone"
            dataKey={dataKey}
            name="Evolución del KPI"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            activeDot={{ r: 8 }}
            />
        </LineChart>
        </ResponsiveContainer>
    </div>
  );
}
