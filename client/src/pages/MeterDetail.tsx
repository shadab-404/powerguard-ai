/**
 * Meter detail — usage history, risk, exports
 */

import { useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  Download,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { Meter } from "@/types";
import DashboardLayout from "@/components/DashboardLayout";
import ApiErrorState from "@/components/ApiErrorState";
import StatusBadge from "@/components/StatusBadge";
import RiskScoreRing from "@/components/RiskScoreRing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MeterDetail() {
  const { meterId } = useParams<{ meterId: string }>();
  const url = meterId ? `/api/meters/${encodeURIComponent(meterId)}` : null;

  const { data: meter, loading, error, refetch } = useApi<Meter>(url, {
    skip: !meterId,
  });

  const exportCsv = useCallback(() => {
    if (!meter) return;
    const header = ["Date", "Actual_kWh", "Expected_kWh"];
    const rows = meter.usageHistory.map(p => [
      p.timestamp,
      String(p.consumption),
      String(p.expected),
    ]);
    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `powerguard-${meter.id}-usage.csv`;
    a.click();
    URL.revokeObjectURL(u);
    toast.success("Exported", { description: `Saved ${meter.id} usage history.` });
  }, [meter]);

  const reportStub = useCallback(() => {
    toast.success("Report queued", {
      description: "Demo: connect PDF service for printable inspection packs.",
    });
  }, []);

  const stats = useMemo(() => {
    if (!meter) return null;
    const history = meter.usageHistory;
    const consumptions = history.map(h => h.consumption);
    const averageConsumption =
      consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
    const maxConsumption = Math.max(...consumptions);
    const minConsumption = Math.min(...consumptions);
    const variance =
      ((meter.consumption - meter.expectedUsage) / meter.expectedUsage) * 100;

    return {
      averageConsumption: averageConsumption.toFixed(1),
      maxConsumption: maxConsumption.toFixed(1),
      minConsumption: minConsumption.toFixed(1),
      variance: variance.toFixed(1),
    };
  }, [meter]);

  const chartData = useMemo(() => {
    if (!meter) return [];
    return meter.usageHistory.map(point => ({
      date: new Date(point.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      actual: point.consumption,
      expected: point.expected,
      timestamp: point.timestamp,
    }));
  }, [meter]);

  if (!meterId) {
    return (
      <DashboardLayout>
        <Card className="max-w-lg border-border/80">
          <CardHeader>
            <CardTitle>Invalid meter</CardTitle>
            <CardDescription>No meter ID in the URL.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link to="/meters">Back to meters</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="size-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !meter) {
    const is404 = error?.toLowerCase().includes("not found");
    if (error && !is404) {
      return (
        <DashboardLayout>
          <ApiErrorState message={error} onRetry={refetch} />
        </DashboardLayout>
      );
    }
    return (
      <DashboardLayout>
        <Card className="mx-auto max-w-lg border-border/80">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-amber-500/15">
              <AlertTriangle className="size-8 text-amber-600 dark:text-amber-400" />
            </div>
            <CardTitle>Meter not found</CardTitle>
            <CardDescription>
              No meter registered for “{meterId}”.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-2">
            <Button asChild variant="secondary">
              <Link to="/meters">
                <ArrowLeft className="size-4" />
                Meters directory
              </Link>
            </Button>
            <Button asChild>
              <Link to="/">Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!stats) return null;

  return (
    <DashboardLayout>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <Button variant="outline" size="icon" asChild aria-label="Back to meters">
              <Link to="/meters">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <p className="font-mono text-sm text-muted-foreground">{meter.id}</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {meter.location}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Last reading{" "}
                {new Date(meter.lastUpdated).toLocaleString()}
              </p>
            </div>
          </div>
          <StatusBadge status={meter.status} size="lg" />
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Current consumption</CardDescription>
              <CardTitle className="font-mono text-3xl tabular-nums">
                {meter.consumption.toFixed(1)}{" "}
                <span className="text-base font-normal text-muted-foreground">
                  kWh
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Expected {meter.expectedUsage.toFixed(1)} kWh
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Risk score</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-2">
              <RiskScoreRing score={meter.riskScore} size="lg" showLabel={false} />
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>30-day average</CardDescription>
              <CardTitle className="font-mono text-3xl tabular-nums">
                {stats.averageConsumption}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Range {stats.minConsumption} – {stats.maxConsumption} kWh
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Variance vs expected</CardDescription>
              <CardTitle
                className={`font-mono text-3xl tabular-nums ${
                  parseFloat(stats.variance) > 0
                    ? "text-destructive"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {stats.variance}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrendingUp
                className={`size-4 ${
                  parseFloat(stats.variance) > 0
                    ? "text-destructive"
                    : "text-emerald-600"
                }`}
              />
            </CardContent>
          </Card>
        </section>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Usage history</CardTitle>
            <CardDescription>
              Daily actual vs expected — last {chartData.length} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="mdActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--destructive)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--destructive)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="mdExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="var(--destructive)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#mdActual)"
                    name="Actual"
                  />
                  <Area
                    type="monotone"
                    dataKey="expected"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#mdExpected)"
                    name="Expected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Installation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Location
                  </p>
                  <p className="font-medium">{meter.location}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Last updated
                  </p>
                  <p className="font-medium">
                    {new Date(meter.lastUpdated).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {meter.status === "normal" && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-200">
                  Normal operation — within expected band.
                </div>
              )}
              {meter.status === "suspicious" && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
                  Suspicious — consumption pattern diverges from baseline. Field
                  check recommended.
                </div>
              )}
              {meter.status === "critical" && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  Critical — prioritize investigation and possible service disconnect
                  per policy.
                </div>
              )}
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <span className="text-xs text-muted-foreground">Status</span>
                <StatusBadge status={meter.status} size="sm" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" asChild>
            <Link to="/meters">Back to meters</Link>
          </Button>
          <Button variant="outline" onClick={reportStub}>
            <FileText className="size-4" />
            Inspection report
          </Button>
          <Button onClick={exportCsv}>
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
