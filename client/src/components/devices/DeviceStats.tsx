import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Device } from "@/lib/types";
import { Activity, HardDrive, Wifi, Clock } from "lucide-react";

interface DeviceStatsProps {
  device: Device;
}

export function DeviceStats({ device }: DeviceStatsProps) {
  return (
    <div className="grid gap-4 grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold capitalize ${
            device.status === 'online' ? 'text-green-500' : 
            device.status === 'warning' ? 'text-orange-500' : 'text-red-500'
          }`}>
            {device.status || 'Unknown'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{device.deviceType}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            SNMP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{device.snmpVersion || 'N/A'}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            SSH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{device.sshEnabled ? 'Enabled' : 'Disabled'}</div>
        </CardContent>
      </Card>
    </div>
  );
}
