import React from "react";
import { Alert } from "@/types";
import RiskScoreRing from "@/components/RiskScoreRing";

export default function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">High Risk Alerts</h3>
      <div className="grid gap-3 sm:grid-cols-1">
        {alerts.slice(0, 5).map(a => (
          <div
            key={a.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-gradient-to-br from-white/60 to-white/30 p-3 shadow-sm"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-mono text-sm font-medium text-primary">{a.meterId}</div>
                <div className="text-xs text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-sm text-foreground/90">{a.meterLocation}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-semibold">{a.consumption.toFixed(1)} kWh</div>
                <div className="text-xs text-muted-foreground">exp {a.expectedUsage.toFixed(1)}</div>
              </div>
              <RiskScoreRing score={a.riskScore} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
