import React, { useEffect, useRef, useState } from "react";

function easeOutQuad(t: number) {
  return t * (2 - t);
}

export default function CountUp({
  value,
  duration = 800,
  format = (v: number) => String(v),
}: {
  value: number;
  duration?: number;
  format?: (v: number) => string;
}) {
  const [current, setCurrent] = useState(value);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const start = performance.now();
    startRef.current = start;

    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutQuad(t);
      const next = Math.round(from + (to - from) * eased);
      setCurrent(next);
      if (t < 1) requestAnimationFrame(frame);
      else fromRef.current = to;
    };

    requestAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span>{format(current)}</span>;
}
