import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Network } from "lucide-react";
import { useLocation } from "wouter";

export default function MacAlarms() {
  const [, navigate] = useLocation();

  const devices = useSelector((s: RootState) => s.devices.items);
  const macLogs = useSelector((s: RootState) => s.macChanges.logs);

  // Flatten mac logs
  const allLogs = Object.values(macLogs).flat();

  // Filter devices with MAC changes
  const affectedDevices = devices.filter((d) =>
    allLogs.some((log) => log.device_id === d.id)
  );

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-yellow-600" />
        MAC Change Alarms
      </h1>

      {affectedDevices.length === 0 ? (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-green-600">
              No MAC Changes Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All network devices are stable. No suspicious MAC changes found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {affectedDevices.map((device) => {
            const deviceName = `Device ${device.id}`;
            const deviceLogs = allLogs.filter(
              (l) => l.device_id === device.id
            );

            return (
              <Card
                key={device.id}
                className="border-l-4 border-l-yellow-500 cursor-pointer hover:bg-accent transition"
                onClick={() => navigate(`/devices/${device.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <Network className="w-4 h-4" />
                    {deviceName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {deviceLogs.length} MAC change events
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Click to view full details →
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
