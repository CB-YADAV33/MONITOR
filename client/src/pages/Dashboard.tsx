import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchDevices } from "@/features/devices/devicesSlice";
import { fetchAlerts } from "@/features/alerts/alertsSlice";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { BandwidthChart } from "@/components/dashboard/BandwidthChart";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";
import { useLocation } from "wouter";

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const devices = useSelector((state: RootState) => state.devices.items);
  const alerts = useSelector((state: RootState) => state.alerts.items);
  const [, setLocation] = useLocation(); // ✅ useLocation provides setter to navigate

  useEffect(() => {
    dispatch(fetchDevices());
    dispatch(fetchAlerts());
  }, [dispatch]);

  // Handler for card clicks
  const handleCardClick = (status: "online" | "offline" | "warning" | "all") => {
    if (status === "all") {
      setLocation("/devices");
    } else {
      setLocation(`/devices?filter=${status}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Overview</h1>
          <p className="text-muted-foreground">System status and key performance indicators</p>
        </div>
      </div>

      <StatsCards
        devices={devices}
        alerts={alerts}
        onCardClick={handleCardClick}
        customCardNames={{ offline: "Offline Devices" }}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <BandwidthChart />
        <AlertsFeed alerts={alerts} />
      </div>
    </div>
  );
}
