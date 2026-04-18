import { useCallback, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ApiErrorState from "@/components/ApiErrorState";
import { Download, FileText, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useApi } from "@/hooks/useApi";
import { DashboardStats } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TrendRow = {
  day: string;
  normal: number;
  anomaly: number;
  total: number;
};

export default function Reports() {
  const { data: dashboardData, loading, error, refetch } = useApi<{
    stats: DashboardStats;
    trendData: TrendRow[];
  }>("/api/dashboard");

  const trendData = useMemo(() => {
    if (!dashboardData?.trendData) return [];
    return dashboardData.trendData.slice(-30);
  }, [dashboardData]);

  const dashboardStats = dashboardData?.stats;

  const downloadCsv = useCallback(() => {
    if (trendData.length === 0) {
      toast.error("No trend data to export.");
      return;
    }
    const header = ["Day", "Normal_kWh", "Suspicious_kWh", "Total_kWh"];
    const rows = trendData.map(d => [
      d.day,
      String(d.normal),
      String(d.anomaly),
      String(d.total),
    ]);
    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `powerguard-usage-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded", {
      description: "CSV file saved to your downloads folder.",
    });
  }, [trendData]);

  const downloadPdfStub = useCallback(() => {
    toast.success("Summary ready", {
      description:
        "Demo build: use CSV export. PDF pipeline can be wired to your reporting service.",
    });
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="size-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dashboardStats || !dashboardData) {
    return (
      <DashboardLayout>
        <ApiErrorState
          message={error ?? "Could not load report data."}
          onRetry={refetch}
        />
      </DashboardLayout>
    );
  }

  const readsApprox = dashboardStats.totalMeters * 30;
  const anomaliesLogged = dashboardStats.suspiciousMeters * 4;

  return (
    <DashboardLayout>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Analytics
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Reports & exports
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Rolling consumption and anomaly overlay from the same dataset as
              the dashboard. Export CSV for audits or offline analysis.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={downloadPdfStub}>
              <FileText className="size-4" />
              Summary (demo)
            </Button>
            <Button onClick={downloadCsv}>
              <Download className="size-4" />
              Download CSV
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <FileText className="size-4" />
                </div>
                <CardTitle className="text-sm font-medium">
                  Reports (YTD)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-semibold tabular-nums">12</p>
              <p className="text-xs text-muted-foreground">Demo static count</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="size-4" />
                </div>
                <CardTitle className="text-sm font-medium">
                  Meter reads (30d)
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-semibold tabular-nums">
                {readsApprox.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                ~1 read / meter / day (estimate)
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-4" />
                </div>
                <CardTitle className="text-sm font-medium">
                  Anomaly events
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                {anomaliesLogged}
              </p>
              <p className="text-xs text-muted-foreground">
                Derived from non-normal meters
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-violet-500/10 p-2 text-violet-600 dark:text-violet-400">
                  <TrendingUp className="size-4" />
                </div>
                <CardTitle className="text-sm font-medium">Fleet risk</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-semibold tabular-nums">
                {dashboardStats.riskPercentage}%
              </p>
              <p className="text-xs text-muted-foreground">System risk index</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">30-day consumption overlay</CardTitle>
            <CardDescription>
              Normal baseline vs suspicious component (same series as dashboard
              trends).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full min-h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="repNormal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="repAnomaly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                    tickFormatter={v => `${Math.round(Number(v) / 1000)}k`}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area
                    type="monotone"
                    dataKey="normal"
                    name="Normal (kWh)"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#repNormal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="anomaly"
                    name="Suspicious (kWh)"
                    stroke="var(--destructive)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#repAnomaly)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
