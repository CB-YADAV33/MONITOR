import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { addDevice, deleteDevice, setFilter } from '@/features/devices/devicesSlice';
import { DeviceGrid } from '@/components/devices/DeviceGrid';
import { AddDeviceDialog } from '@/components/devices/AddDeviceDialog';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export default function Devices() {
  const dispatch = useDispatch();
  const { items, filter } = useSelector((state: RootState) => state.devices);

  const filteredDevices = items.filter(device => {
    if (filter === 'all') return true;
    return device.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground">Manage your network inventory</p>
        </div>
        <AddDeviceDialog onAdd={(device) => dispatch(addDevice(device))} />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(value) => dispatch(setFilter(value))}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DeviceGrid 
        devices={filteredDevices} 
        onDelete={(id) => dispatch(deleteDevice(id))} 
      />
    </div>
  );
}
