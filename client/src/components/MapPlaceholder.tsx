import React from "react";

export default function MapPlaceholder({
  hotspots = [],
}: {
  hotspots?: Array<{ id: string; left: string; top: string; severity?: "low" | "med" | "high" }>;
}) {
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-md bg-gradient-to-br from-sky-50 to-white/80 p-4 shadow-inner">
      <div className="pointer-events-none absolute inset-0 opacity-10 grayscale">
        {/* Simple SVG placeholder - stylized map blob */}
        <svg viewBox="0 0 800 500" className="h-full w-full">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path d="M100 200 C150 100,250 100,300 200 C350 300,450 300,500 200 C550 100,650 100,700 200 L700 400 L100 400 Z" fill="url(#g1)" />
        </svg>
      </div>

      {hotspots.map(h => (
        <div
          key={h.id}
          className={`absolute flex translate-x-[-50%] translate-y-[-50%] items-center gap-2`}
          style={{ left: h.left, top: h.top }}
        >
          <div
            className={`h-3 w-3 rounded-full shadow-lg ${
              h.severity === "high" ? "bg-red-500" : h.severity === "med" ? "bg-orange-400" : "bg-emerald-400"
            }`}
          />
          <span className="text-xs font-medium text-foreground/80">{h.id}</span>
        </div>
      ))}
    </div>
  );
}
