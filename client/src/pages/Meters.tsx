import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ApiErrorState from "@/components/ApiErrorState";
import { Search, Filter, Hash } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { Meter } from "@/types";
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

export default function Meters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: metersData, loading, error, refetch } = useApi<Meter[]>("/api/meters");

  const filteredMeters = useMemo(() => {
    if (!metersData) return [];
    return metersData.filter(meter => {
      const matchesSearch =
        meter.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meter.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || meter.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, metersData]);

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
              Fleet
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Meters directory
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search, filter, and open detailed telemetry for any endpoint.
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
                aria-label="Search meters"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-full sm:w-[160px]">
                <Filter className="mr-2 size-4 shrink-0 opacity-70" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="text-base font-medium">
              {filteredMeters.length} meter
              {filteredMeters.length === 1 ? "" : "s"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Meter
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Location
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                      Usage (kWh)
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
                  {filteredMeters.length > 0 ? (
                    filteredMeters.map(meter => (
                      <tr key={meter.id} className="hover:bg-muted/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <Hash className="size-4 text-muted-foreground" />
                            </div>
                            <div>
                              <Link
                                to={`/meter/${meter.id}`}
                                className="font-mono font-semibold text-primary hover:underline"
                              >
                                {meter.id}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                Updated{" "}
                                {new Date(meter.lastUpdated).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[240px] px-4 py-3 text-foreground">
                          {meter.location}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span className="font-medium">
                            {meter.consumption.toFixed(1)}
                          </span>
                          <span className="ml-1 text-xs text-muted-foreground">
                            vs {meter.expectedUsage.toFixed(1)} exp.
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <RiskScoreRing
                              score={meter.riskScore}
                              size="sm"
                              showLabel={false}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={meter.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="secondary" size="sm" asChild>
                            <Link to={`/meter/${meter.id}`}>View detail</Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-muted-foreground"
                      >
                        No meters match your filters.
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
