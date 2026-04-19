import React from "react";

export default function AIInsights({ insights = [] }: { insights?: string[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">AI Insights</h3>
      <div className="rounded-md bg-gradient-to-br from-white/60 to-white/30 p-4 shadow-sm">
        <ul className="space-y-2 text-sm">
          {insights.length ? (
            insights.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-400" />
                <div>{s}</div>
              </li>
            ))
          ) : (
            <li className="text-muted-foreground">No AI insights available</li>
          )}
        </ul>
      </div>
    </div>
  );
}
