import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ApiErrorState from "@/components/ApiErrorState";
import { Search, Filter, AlertTriangle, ArrowRight } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { Alert } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import RiskScoreRing from "@/components/RiskScoreRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const { data: alertsData, loading, error, refetch } = useApi<Alert[]>("/api/alerts");

  const filteredAlerts = useMemo(() => {
    if (!alertsData) return [];
    return alertsData.filter(alert => {
      const matchesSearch =
        alert.meterId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.meterLocation.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesRisk = true;
      if (riskFilter === "critical") matchesRisk = alert.riskScore >= 80;
      else if (riskFilter === "high")
        matchesRisk = alert.riskScore >= 50 && alert.riskScore < 80;
      else if (riskFilter === "medium")
        matchesRisk = alert.riskScore >= 20 && alert.riskScore < 50;

      return matchesSearch && matchesRisk;
    });
  }, [searchTerm, riskFilter, alertsData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="size-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ApiErrorState message={error} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Operations
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Security alerts
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Non-normal meters ranked by risk. Open a meter to investigate.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search ID or location…"
                className="h-10 pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                aria-label="Search alerts"
              />
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="h-10 w-full sm:w-[180px]">
                <Filter className="mr-2 size-4 shrink-0 opacity-70" />
                <SelectValue placeholder="Risk band" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All risk levels</SelectItem>
                <SelectItem value="critical">Critical (80+)</SelectItem>
                <SelectItem value="high">High (50–79)</SelectItem>
                <SelectItem value="medium">Medium (20–49)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="text-base font-medium">
              {filteredAlerts.length} alert
              {filteredAlerts.length === 1 ? "" : "s"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Alert
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Location
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Usage vs expected
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
                  {filteredAlerts.length > 0 ? (
                    filteredAlerts.map(alert => (
                      <tr
                        key={alert.id}
                        className={
                          alert.riskScore >= 80
                            ? "bg-destructive/5 hover:bg-muted/40"
                            : "hover:bg-muted/40"
                        }
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                                alert.status === "critical"
                                  ? "bg-destructive/15 text-destructive"
                                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              <AlertTriangle className="size-4" />
                            </div>
                            <div>
                              <Link
                                to={`/meter/${alert.meterId}`}
                                className="font-mono font-semibold text-primary hover:underline"
                              >
                                {alert.meterId}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[220px] px-4 py-3">{alert.meterLocation}</td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-medium tabular-nums">
                            {alert.consumption.toFixed(1)} kWh
                          </p>
                          <p className="text-xs text-muted-foreground">
                            exp. {alert.expectedUsage.toFixed(1)} kWh
                          </p>
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
                          <Button size="sm" asChild>
                            <Link
                              to={`/meter/${alert.meterId}`}
                              className="gap-1"
                            >
                              Investigate
                              <ArrowRight className="size-3.5" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                          <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            <span className="text-2xl">✓</span>
                          </div>
                          <p className="font-medium text-foreground">
                            No alerts in this view
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Adjust search or risk filters, or your fleet is clear.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
