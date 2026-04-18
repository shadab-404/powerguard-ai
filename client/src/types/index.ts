export interface Meter {
  id: string;
  location: string;
  consumption: number;
  expectedUsage: number;
  riskScore: number;
  status: 'normal' | 'suspicious' | 'critical';
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
  status: 'normal' | 'suspicious' | 'critical';
  timestamp: string;
}

export interface DashboardStats {
  totalMeters: number;
  suspiciousMeters: number;
  riskPercentage: number;
}
