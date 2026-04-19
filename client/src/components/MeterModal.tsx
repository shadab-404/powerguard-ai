import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Alert } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import RiskScoreRing from "@/components/RiskScoreRing";

export default function MeterModal({
  open,
  onOpenChange,
  alert,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Accept any shape to allow demo history for the modal
  alert?: any | null;
}) {
  const history = ((alert && alert.history) || []).map((h: any, i: number) => ({
    time: new Date(h.timestamp).toLocaleTimeString(),
    value: h.value,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Meter {alert?.meterId}</DialogTitle>
          <DialogDescription>{alert?.meterLocation}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <RiskScoreRing score={alert?.riskScore ?? 0} />
              <div>
                <div className="text-sm font-semibold">Risk score</div>
                <div className="text-xs text-muted-foreground">{alert?.riskScore}%</div>
              </div>
            </div>
            <StatusBadge status={alert?.status ?? "suspicious"} />
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history.length ? history : [{ time: "0", value: 0 }] }>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Recent events</h4>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {(alert?.history ?? []).slice(0, 5).map((h: any, idx: number) => (
                <li key={idx}>{new Date(h.timestamp).toLocaleString()}: {h.value} kWh</li>
              ))}
            </ul>
          </div>

          <DialogFooter>
            <button className="btn" onClick={() => onOpenChange(false)}>Close</button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
