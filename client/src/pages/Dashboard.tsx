/**
 * Dashboard — KPIs, charts, and recent alerts
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ArrowRight, AlertTriangle, Zap, TrendingUp, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import LiveIndicator from "@/components/LiveIndicator";
import CountUp from "@/components/CountUp";
import MapPlaceholder from "@/components/MapPlaceholder";
import AlertsPanel from "@/components/AlertsPanel";
import MeterModal from "@/components/MeterModal";
import AIInsights from "@/components/AIInsights";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatusBadge from "@/components/StatusBadge";
import RiskScoreRing from "@/components/RiskScoreRing";
import ApiErrorState from "@/components/ApiErrorState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";
import { Alert, DashboardStats } from "@/types";

export default function Dashboard() {
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useApi<{
    stats: DashboardStats;
    anomalies: { name: string; value: number; fill: string }[];
    trendData: { day: string; total: number; normal: number; anomaly: number }[];
  }>("/api/dashboard");
  const { data: alertsData } = useApi<Alert[]>("/api/alerts");

  const lastUpdated = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date()),
    []
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [live, setLive] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);

  // Auto-refresh every 5 seconds to create a live feeling
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      refetchDashboard();
    }, 5000);
    return () => clearInterval(id);
  }, [live, refetchDashboard]);

  if (dashboardLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="size-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (dashboardError || !dashboardData) {
    return (
      <DashboardLayout>
        <ApiErrorState
          message={dashboardError ?? "No dashboard data returned."}
          onRetry={refetchDashboard}
        />
      </DashboardLayout>
    );
  }

  const { stats, anomalies, trendData } = dashboardData;
  const alerts = (alertsData ?? []).slice(0, 5);
  const totalMeters = Math.max(0, stats.totalMeters);
  const suspiciousPct =
    totalMeters > 0
      ? Math.round((stats.suspiciousMeters / totalMeters) * 100)
      : 0;

  return (
    <DashboardLayout>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-500">
        <div className="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Command center
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Electricity theft detection
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Live KPIs, consumption trends, and prioritized investigations across
              your meter fleet.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Updated {lastUpdated}</p>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardDescription>Total meters</CardDescription>
                <CardTitle className="mt-2 font-mono text-3xl tabular-nums">
                  <CountUp value={stats.totalMeters} />
                </CardTitle>
              </div>
              <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                <Zap className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Under active monitoring</p>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs">
                <TrendingUp className="size-3.5 text-emerald-500" />
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  +2.5% vs last month
                </span>
                <span className="text-muted-foreground">(demo)</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardDescription>Suspicious meters</CardDescription>
                <CardTitle className="mt-2 font-mono text-3xl tabular-nums text-amber-500">
                  <CountUp value={stats.suspiciousMeters} />
                </CardTitle>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500">
                <AlertTriangle className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Require follow-up</p>
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                    style={{ width: `${suspiciousPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {suspiciousPct}% of fleet
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardDescription>Risk index</CardDescription>
                <CardTitle className="mt-2 font-mono text-3xl tabular-nums text-red-500">
                  <CountUp value={stats.riskPercentage} format={(v) => `${v}%`} />
                </CardTitle>
              </div>
              <div className="rounded-lg bg-red-500/10 p-2.5 text-red-500">
                <AlertTriangle className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">System-wide estimate</p>
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-[0_0_12px_rgba(239,68,68,0.35)]"
                    style={{ width: `${Math.min(100, stats.riskPercentage)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.max(0, totalMeters - stats.suspiciousMeters)} meters nominal
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-border/80 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Electricity usage trend</CardTitle>
              <CardDescription>
                Aggregated consumption — last 14 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        backdropFilter: "blur(8px)",
                      }}
                      labelStyle={{ fontWeight: 600, color: "var(--foreground)" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Total (kWh)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Normal vs suspicious</CardTitle>
              <CardDescription>Last 7 days — comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData.slice(-7)}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                      opacity={0.6}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="normal"
                      name="Normal (kWh)"
                      fill="hsl(142 71% 45%)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="anomaly"
                      name="Suspicious (kWh)"
                      fill="hsl(0 84% 60%)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Meter distribution</CardTitle>
              <CardDescription>Status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                    <Pie
                      data={anomalies}
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {anomalies.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Recent alerts</CardTitle>
              <CardDescription>
                Highest-risk meters — open an investigation
              </CardDescription>
            </div>
            <Link
              to="/alerts"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-2 pt-0 sm:px-6">
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-muted/40">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Meter ID
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Location
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      kWh
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Expected
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Risk
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {alerts.map(alert => (
                    <tr
                      key={alert.id}
                      className={
                        alert.status === "critical"
                          ? "bg-destructive/5 hover:bg-muted/50"
                          : "hover:bg-muted/50"
                      }
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedAlert(alert);
                            setModalOpen(true);
                          }}
                          className="font-mono font-medium text-primary hover:underline"
                        >
                          {alert.meterId}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {alert.meterLocation}
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">
                        {alert.consumption.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {alert.expectedUsage.toFixed(1)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <RiskScoreRing
                            score={alert.riskScore}
                            size="sm"
                            showLabel={false}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={alert.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedAlert(alert);
                            setModalOpen(true);
                          }}
                          className="inline-flex rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
                        >
                          Investigate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* New enhanced area: map, AI insights and alerts panel */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Geographic hotspots</CardTitle>
                <CardDescription>
                  Map view of suspicious activity (demo)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MapPlaceholder
                  hotspots={[
                    { id: "M008", left: "24%", top: "32%", severity: "high" },
                    { id: "M005", left: "48%", top: "45%", severity: "med" },
                    { id: "M011", left: "68%", top: "62%", severity: "low" },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">AI Insights</CardTitle>
                <CardDescription>Automated observations from the model</CardDescription>
              </CardHeader>
              <CardContent>
                <AIInsights insights={insights} />
              </CardContent>
            </Card>

            <div className="mt-4">
              <AlertsPanel alerts={alertsData ?? []} />
            </div>
          </div>
        </section>

        <MeterModal open={modalOpen} onOpenChange={setModalOpen} alert={selectedAlert} />
      </div>
    </DashboardLayout>
  );
}
