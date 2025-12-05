import { useEffect } from 'react';
import { useParams } from 'wouter';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { selectDevice } from '@/features/devices/devicesSlice';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Shield, ArrowLeft, RefreshCw, Settings } from "lucide-react";
import { Link } from "wouter";
import { InterfaceTable } from '@/components/devices/InterfaceTable';
import { DeviceStats } from '@/components/devices/DeviceStats';

export default function DeviceDetail() {
  const params = useParams();
  const id = parseInt(params.id || '0');
  const dispatch = useDispatch();
  const { selectedDevice, selectedDeviceInterfaces } = useSelector((state: RootState) => state.devices);

  useEffect(() => {
    if (id) {
      dispatch(selectDevice(id));
    }
  }, [id, dispatch]);

  if (!selectedDevice) {
    return <div>Device not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/devices">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              {selectedDevice.hostname}
              <Badge variant="outline" className={
                selectedDevice.status === 'online' ? "text-green-500 border-green-500" : "text-red-500 border-red-500"
              }>
                {selectedDevice.status.toUpperCase()}
              </Badge>
            </h1>
            <p className="text-muted-foreground font-mono text-sm mt-1">
              {selectedDevice.ip_address} • {selectedDevice.model} • {selectedDevice.os_version}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Poll Now
          </Button>
          <Button variant="outline">
            <Terminal className="mr-2 h-4 w-4" />
            SSH
          </Button>
          <Button variant="outline">
            <Shield className="mr-2 h-4 w-4" />
            Backup
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Stats */}
        <div className="space-y-6">
          <DeviceStats device={selectedDevice} />
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold mb-4">Device Information</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Vendor</span>
                <span>{selectedDevice.vendor}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Uptime</span>
                <span>{selectedDevice.uptime}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Last Seen</span>
                <span>{new Date(selectedDevice.last_seen).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">SNMP Version</span>
                <span>{selectedDevice.snmp_version}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">SSH Port</span>
                <span>{selectedDevice.ssh_port}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interfaces & Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="interfaces" className="w-full">
            <TabsList>
              <TabsTrigger value="interfaces">Interfaces</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="config">Running Config</TabsTrigger>
            </TabsList>
            
            <TabsContent value="interfaces" className="mt-4">
              <InterfaceTable interfaces={selectedDeviceInterfaces} />
            </TabsContent>
            
            <TabsContent value="alerts" className="mt-4">
              <div className="rounded-md border p-8 text-center text-muted-foreground">
                No active alerts for this device.
              </div>
            </TabsContent>
            
            <TabsContent value="config" className="mt-4">
              <div className="rounded-md border bg-muted p-4 font-mono text-xs overflow-auto max-h-[500px]">
                <pre>{`!
version 16.12
no service pad
service timestamps debug datetime msec
service timestamps log datetime msec
!
hostname ${selectedDevice.hostname}
!
interface GigabitEthernet1/0/1
 description Uplink to Core
 switchport mode trunk
!
interface GigabitEthernet1/0/2
 description User Access
 switchport mode access
 switchport access vlan 10
!
end`}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
