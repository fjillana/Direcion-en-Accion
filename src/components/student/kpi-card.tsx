import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  trend: "up" | "down";
  change: string;
}

export function KpiCard({ title, value, trend, change }: KpiCardProps) {
  const isUp = trend === "up";
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {isUp ? (
          <TrendingUp className="h-4 w-4 text-emerald-600" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-600" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={cn(
            "text-xs text-muted-foreground",
            isUp ? "text-emerald-600" : "text-red-600"
          )}
        >
          {change} desde la última ronda
        </p>
      </CardContent>
    </Card>
  );
}
