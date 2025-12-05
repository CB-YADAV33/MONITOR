import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, CheckCircle, XCircle, Server } from "lucide-react";
import { Device, Alert } from "@/lib/types";

interface StatsCardsProps {
  devices: Device[];
  alerts: Alert[];
}

export function StatsCards({ devices, alerts }: StatsCardsProps) {
  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;
  const warningCount = devices.filter(d => d.status === 'warning').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-l-4 border-l-green-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{onlineCount}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round((onlineCount / devices.length) * 100)}% of fleet
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{offlineCount}</div>
          <p className="text-xs text-muted-foreground">
            Devices unreachable
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{criticalAlerts + warningAlerts}</div>
          <div className="flex gap-2 text-xs text-muted-foreground mt-1">
            <span className="text-red-500 font-medium">{criticalAlerts} Critical</span>
            <span className="text-orange-500 font-medium">{warningAlerts} Warning</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
          <Server className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{devices.length}</div>
          <p className="text-xs text-muted-foreground">
            Managed devices
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
