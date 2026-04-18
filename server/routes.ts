import { Router } from "express";
import {
  dashboardStats,
  anomalyData,
  usageTrendData,
  metersData,
  alertsData,
} from "../shared/dummyData.ts";

const router = Router();

// Test Health Route
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend API is running!" });
});

// GET /api/dashboard
router.get("/dashboard", (req, res) => {
  res.json({
    stats: dashboardStats,
    anomalies: anomalyData,
    trendData: usageTrendData,
  });
});

// GET /api/meters
router.get("/meters", (req, res) => {
  res.json(metersData);
});

// GET /api/meters/:id
router.get("/meters/:id", (req, res) => {
  const meter = metersData.find(m => m.id === req.params.id);
  if (!meter) {
    return res.status(404).json({ error: "Meter not found" });
  }
  res.json(meter);
});

// GET /api/alerts
router.get("/alerts", (req, res) => {
  res.json(alertsData);
});

// GET /api/reports - We can just return some structured data or use alerts/meters
router.get("/reports", (req, res) => {
  res.json({
    message: "Report data structure",
    meters: metersData,
    alerts: alertsData
  });
});

export default router;
