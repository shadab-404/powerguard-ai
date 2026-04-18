/**
 * PowerGuard AI — shared dummy data for API + Vite dev middleware
 */

export interface Meter {
  id: string;
  location: string;
  consumption: number;
  expectedUsage: number;
  riskScore: number;
  status: "normal" | "suspicious" | "critical";
  lastUpdated: string;
  usageHistory: UsagePoint[];
}

export interface UsagePoint {
  timestamp: string;
  consumption: number;
  expected: number;
}

export interface Alert {
  id: string;
  meterId: string;
  meterLocation: string;
  consumption: number;
  expectedUsage: number;
  riskScore: number;
  status: "normal" | "suspicious" | "critical";
  timestamp: string;
}

export interface DashboardStats {
  totalMeters: number;
  suspiciousMeters: number;
  riskPercentage: number;
}

const generateUsageHistory = (meterId: string, days: number = 30): UsagePoint[] => {
  const history: UsagePoint[] = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const timestamp = date.toISOString().split("T")[0];

    const baseConsumption = 100 + Math.random() * 50;
    const anomalyChance = Math.random();

    let consumption = baseConsumption;
    if (meterId.includes("M005") || meterId.includes("M008")) {
      if (anomalyChance > 0.7) {
        consumption = baseConsumption * (1.5 + Math.random() * 1.5);
      }
    }

    history.push({
      timestamp,
      consumption: Math.round(consumption * 10) / 10,
      expected: Math.round(baseConsumption * 10) / 10,
    });
  }

  return history;
};

export const metersData: Meter[] = [
  {
    id: "M001",
    location: "Downtown District - Block A",
    consumption: 145.2,
    expectedUsage: 120.5,
    riskScore: 15,
    status: "normal",
    lastUpdated: new Date().toISOString(),
    usageHistory: generateUsageHistory("M001"),
  },
  {
    id: "M002",
    location: "Residential Area - Sector 5",
    consumption: 98.7,
    expectedUsage: 95.2,
    riskScore: 8,
    status: "normal",
    lastUpdated: new Date().toISOString(),
    usageHistory: generateUsageHistory("M002"),
  },
  {
    id: "M003",
    location: "Industrial Zone - Unit 12",
    consumption: 520.3,
    expectedUsage: 510.0,
    riskScore: 12,
    status: "normal",
    lastUpdated: new Date().toISOString(),
    usageHistory: generateUsageHistory("M003"),
  },
  {
    id: "M004",
    location: "Commercial Hub - Tower B",
    consumption: 285.6,
    expectedUsage: 280.0,
    riskScore: 10,
    status: "normal",
    lastUpdated: new Date().toISOString(),
    usageHistory: generateUsageHistory("M004"),
  },
  {
    id: "M005",
    location: "Residential Area - Sector 8",
    consumption: 245.8,
    expectedUsage: 110.0,
    riskScore: 78,
    status: "suspicious",
    lastUpdated: new Date().toISOString(),
    usageHistory: generateUsageHistory("M005"),
  },
  {
    id: "M006",
    location: "Downtown District - Block C",
    consumption: 132.4,
    expectedUsage: 128.0,
    riskScore: 9,
    status: "normal",
    lastUpdated: new Date().toISOString(),
    usageHistory: generateUsageHistory("M006"),
  },
  {
    id: "M007",
    location: "Suburban Area - Zone 3",
    consumption: 156.9,
    expectedUsage: 105.0,
    riskScore: 42,
    status: "suspicious",
    lastUpdated: new Date().toISOString(),
    usageHistory: generateUsageHistory("M007"),
  },
  {
    id: "M008",
    location: "Industrial Zone - Unit 15",
    consumption: 612.5,
    expectedUsage: 380.0,
    riskScore: 85,
    status: "critical",
    lastUpdated: new Date().toISOString(),
    usageHistory: generateUsageHistory("M008"),
  },
  {
    id: "M009",
    location: "Residential Area - Sector 2",
    consumption: 102.1,
    expectedUsage: 98.5,
    riskScore: 7,
    status: "normal",
    lastUpdated: new Date().toISOString(),
    usageHistory: generateUsageHistory("M009"),
  },
  {
    id: "M010",
    location: "Commercial Hub - Tower A",
    consumption: 298.7,
    expectedUsage: 290.0,
    riskScore: 11,
    status: "normal",
    lastUpdated: new Date().toISOString(),
    usageHistory: generateUsageHistory("M010"),
  },
  {
    id: "M011",
    location: "Downtown District - Block D",
    consumption: 178.3,
    expectedUsage: 115.0,
    riskScore: 55,
    status: "suspicious",
    lastUpdated: new Date().toISOString(),
    usageHistory: generateUsageHistory("M011"),
  },
  {
    id: "M012",
    location: "Suburban Area - Zone 1",
    consumption: 125.6,
    expectedUsage: 120.0,
    riskScore: 6,
    status: "normal",
    lastUpdated: new Date().toISOString(),
    usageHistory: generateUsageHistory("M012"),
  },
];

export const alertsData: Alert[] = metersData
  .filter(meter => meter.status !== "normal")
  .map(meter => ({
    id: `ALERT-${meter.id}`,
    meterId: meter.id,
    meterLocation: meter.location,
    consumption: meter.consumption,
    expectedUsage: meter.expectedUsage,
    riskScore: meter.riskScore,
    status: meter.status,
    timestamp: meter.lastUpdated,
  }))
  .sort((a, b) => b.riskScore - a.riskScore);

export const dashboardStats: DashboardStats = {
  totalMeters: metersData.length,
  suspiciousMeters: metersData.filter(m => m.status !== "normal").length,
  riskPercentage: Math.round(
    (metersData.filter(m => m.status !== "normal").length / metersData.length) * 100
  ),
};

export const anomalyData = [
  {
    name: "Normal",
    value: metersData.filter(m => m.status === "normal").length,
    fill: "#10B981",
  },
  {
    name: "Suspicious",
    value: metersData.filter(m => m.status === "suspicious").length,
    fill: "#F59E0B",
  },
  {
    name: "Critical",
    value: metersData.filter(m => m.status === "critical").length,
    fill: "#EF4444",
  },
];

export const usageTrendData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const baseUsage = 3500 + Math.random() * 500;
  const anomalyUsage = baseUsage * (1 + Math.random() * 0.3);

  return {
    day,
    normal: Math.round(baseUsage),
    anomaly: Math.round(anomalyUsage),
    total: Math.round(baseUsage + anomalyUsage),
  };
});
