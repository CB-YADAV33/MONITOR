import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle, Server, Flame } from "lucide-react";
import { Device, Alert } from "@/lib/types";
import { useLocation } from "wouter";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface StatsCardsProps {
  devices: Device[];
  alerts: Alert[];
  onCardClick?: (status: "offline" | "warning" | "online" | "all") => void;
  customCardNames?: {
    offline?: string;
  };
}

export function StatsCards({ devices, alerts, onCardClick, customCardNames }: StatsCardsProps) {
  const [, setLocation] = useLocation();

  const macLogs = useSelector((s: RootState) => s.macChanges.logs);
  const allMacLogs = Object.values(macLogs).flat();
  const criticalDevices = devices.filter((d) =>
    allMacLogs.some((log) => log.device_id === d.id)
  );

  const onlineCount = devices.filter((d) => d.status === "online").length;
  const offlineCount = devices.filter((d) => d.status === "offline").length;
  const warningCount = devices.filter((d) => d.status === "warning").length;

  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
  const warningAlerts = alerts.filter((a) => a.severity === "warning").length;

  const handleClick = (status: "offline" | "warning" | "online" | "all") => {
    if (onCardClick) {
      onCardClick(status);
    } else {
      // fallback navigation
      if (status === "all") setLocation("/devices");
      else setLocation(`/devices?filter=${status}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-600 bg-green-100";
      case "offline":
        return "text-red-600 bg-red-100";
      case "warning":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

      {/* MAC CHANGE ALARMS */}
      <Card
        className="border-l-4 border-l-yellow-500 shadow-sm cursor-pointer hover:bg-accent transition"
        onClick={() => handleClick("all")}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700">
            MAC Change Alarms
          </CardTitle>
          <Flame className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-700">{criticalDevices.length}</div>
          <p className="text-xs text-muted-foreground">Devices with MAC changes</p>
        </CardContent>
      </Card>

      {/* ONLINE DEVICES */}
      <Card
        className="border-l-4 border-l-green-500 shadow-sm cursor-pointer hover:bg-accent transition"
        onClick={() => handleClick("online")}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{onlineCount}</div>
          <p className="text-xs text-muted-foreground">
            {onlineCount === 0
              ? "No devices are online"
              : `${Math.round((onlineCount / devices.length) * 100)}% of fleet`}
          </p>
        </CardContent>
      </Card>

      {/* OFFLINE DEVICES */}
      <Card
        className="border-l-4 border-l-red-500 shadow-sm cursor-pointer hover:bg-accent transition"
        onClick={() => handleClick("offline")}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {customCardNames?.offline || "Offline Devices"}
          </CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{offlineCount}</div>
          <p className="text-xs text-muted-foreground">
            {offlineCount === 0 ? "All devices reachable" : "Devices unreachable"}
          </p>
        </CardContent>
      </Card>

      {/* ALERTS */}
      <Card
        className="border-l-4 border-l-orange-500 shadow-sm cursor-pointer hover:bg-accent transition"
        onClick={() => handleClick("warning")}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
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

      {/* TOTAL INVENTORY */}
      <Card
        className="border-l-4 border-l-blue-500 shadow-sm cursor-pointer hover:bg-accent transition"
        onClick={() => handleClick("all")}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
          <Server className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{devices.length}</div>
          <p className="text-xs text-muted-foreground">Managed devices</p>
        </CardContent>
      </Card>
    </div>
  );
}
