import type { ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";
import {
  alertsData,
  anomalyData,
  dashboardStats,
  metersData,
  usageTrendData,
} from "./shared/dummyData.ts";

function sendJson(res: ServerResponse, data: unknown, status = 200): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

const handle: Connect.NextHandleFunction = (req, res, next) => {
  const pathname = req.url?.split("?")[0] ?? "";
  if (!pathname.startsWith("/api")) {
    next();
    return;
  }
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end();
    return;
  }

  if (pathname === "/api/health") {
    sendJson(res, { status: "ok", message: "Backend API is running!" });
    return;
  }
  if (pathname === "/api/dashboard") {
    sendJson(res, {
      stats: dashboardStats,
      anomalies: anomalyData,
      trendData: usageTrendData,
    });
    return;
  }
  if (pathname === "/api/meters") {
    sendJson(res, metersData);
    return;
  }
  if (pathname === "/api/alerts") {
    sendJson(res, alertsData);
    return;
  }
  if (pathname === "/api/reports") {
    sendJson(res, {
      message: "Report data structure",
      meters: metersData,
      alerts: alertsData,
    });
    return;
  }

  const meterMatch = pathname.match(/^\/api\/meters\/([^/]+)$/);
  if (meterMatch) {
    const id = decodeURIComponent(meterMatch[1]);
    const meter = metersData.find(m => m.id === id);
    if (!meter) {
      sendJson(res, { error: "Meter not found" }, 404);
      return;
    }
    sendJson(res, meter);
    return;
  }

  sendJson(res, { error: "Not found" }, 404);
};

export function powerguardDevApi(): Plugin {
  return {
    name: "powerguard-dev-api",
    configureServer(server) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle);
    },
  };
}
