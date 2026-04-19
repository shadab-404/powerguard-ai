import React from "react";

export default function LiveIndicator({ size = 10 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span
        className="relative flex h-3 w-3 items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
      </span>
      <span className="text-xs text-emerald-600">Live</span>
    </div>
  );
}
