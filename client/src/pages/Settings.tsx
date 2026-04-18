import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Bell, Gauge, Monitor, RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const STORAGE_KEY = "powerguard-settings-v1";

export type PowerguardSettings = {
  emailAlerts: boolean;
  pushAlerts: boolean;
  weeklyDigest: boolean;
  defaultView: "dashboard" | "meters" | "alerts";
  refreshIntervalSec: number;
  alertRiskThreshold: number;
};

const defaultSettings: PowerguardSettings = {
  emailAlerts: true,
  pushAlerts: false,
  weeklyDigest: true,
  defaultView: "dashboard",
  refreshIntervalSec: 60,
  alertRiskThreshold: 50,
};

function loadSettings(): PowerguardSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultSettings };
    const parsed = JSON.parse(raw) as Partial<PowerguardSettings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return { ...defaultSettings };
  }
}

export default function Settings() {
  const [settings, setSettings] = useState<PowerguardSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const save = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success("Settings saved", {
      description: "Preferences are stored in this browser.",
    });
  }, [settings]);

  const reset = useCallback(() => {
    setSettings({ ...defaultSettings });
    localStorage.removeItem(STORAGE_KEY);
    toast.message("Restored defaults");
  }, []);

  return (
    <DashboardLayout>
      <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto max-w-3xl space-y-8 duration-500">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Notification rules and UI defaults for this demo session (stored locally
            in your browser).
          </p>
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="size-5 text-primary" />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </div>
            <CardDescription>
              Control how you are notified about new high-risk readings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="email-alerts">Email alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Send digest to your operator email (demo toggle only).
                </p>
              </div>
              <Switch
                id="email-alerts"
                checked={settings.emailAlerts}
                onCheckedChange={v =>
                  setSettings(s => ({ ...s, emailAlerts: v }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="push-alerts">Browser push</Label>
                <p className="text-xs text-muted-foreground">
                  In-app notifications when the app is open.
                </p>
              </div>
              <Switch
                id="push-alerts"
                checked={settings.pushAlerts}
                onCheckedChange={v =>
                  setSettings(s => ({ ...s, pushAlerts: v }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-digest">Weekly summary</Label>
                <p className="text-xs text-muted-foreground">
                  Consolidated fleet risk and top meters.
                </p>
              </div>
              <Switch
                id="weekly-digest"
                checked={settings.weeklyDigest}
                onCheckedChange={v =>
                  setSettings(s => ({ ...s, weeklyDigest: v }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gauge className="size-5 text-primary" />
              <CardTitle className="text-lg">Alert thresholds</CardTitle>
            </div>
            <CardDescription>
              Highlight meters at or above this risk score in lists and digests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Risk highlight ≥ {settings.alertRiskThreshold}</Label>
                <span className="font-mono text-sm text-muted-foreground">
                  / 100
                </span>
              </div>
              <Slider
                value={[settings.alertRiskThreshold]}
                min={10}
                max={95}
                step={5}
                onValueChange={([v]) =>
                  setSettings(s => ({
                    ...s,
                    alertRiskThreshold: v ?? s.alertRiskThreshold,
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="size-5 text-primary" />
              <CardTitle className="text-lg">Display</CardTitle>
            </div>
            <CardDescription>Default landing experience after sign-in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="default-view">Default view</Label>
              <Select
                value={settings.defaultView}
                onValueChange={v =>
                  setSettings(s => ({
                    ...s,
                    defaultView: v as PowerguardSettings["defaultView"],
                  }))
                }
              >
                <SelectTrigger id="default-view" className="max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="meters">Meters</SelectItem>
                  <SelectItem value="alerts">Alerts</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You can still navigate freely from the sidebar; this is for future
                deep-linking.
              </p>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="size-4 text-muted-foreground" />
                <Label>Auto-refresh interval (seconds)</Label>
              </div>
              <Select
                value={String(settings.refreshIntervalSec)}
                onValueChange={v =>
                  setSettings(s => ({ ...s, refreshIntervalSec: Number(v) }))
                }
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="60">60</SelectItem>
                  <SelectItem value="120">120</SelectItem>
                  <SelectItem value="300">300</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Wired for future live polling; data is static in this demo.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <CardTitle className="text-lg">Session</CardTitle>
            </div>
            <CardDescription>
              Sign out from the user menu or sidebar when finished.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button type="button" onClick={save}>
              Save preferences
            </Button>
            <Button type="button" variant="outline" onClick={reset}>
              Reset to defaults
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
