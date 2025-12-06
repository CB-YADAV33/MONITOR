import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  fetchDevices,
  deleteDevice,
  setFilter,
  setSearch,
} from "@/features/devices/devicesSlice";
import { DeviceGrid } from "@/components/devices/DeviceGrid";
import { AddDeviceDialog } from "@/components/devices/AddDeviceDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { createDevice } from "@/lib/api";
import { Device } from "@/lib/types";
import { useLocation } from "wouter";

function useSearchParams() {
  const [location] = useLocation();
  return new URLSearchParams(location.split("?")[1] || "");
}

function getStatusColor(status: string) {
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
}

export default function Devices() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, filter, search, loading } = useSelector(
    (state: RootState) => state.devices
  );
  const searchParams = useSearchParams();
  const urlFilter = searchParams.get("filter");
  const urlSearch = searchParams.get("search");

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  useEffect(() => {
    if (urlFilter && ["online", "offline", "warning", "all"].includes(urlFilter)) {
      dispatch(setFilter(urlFilter));
    }
    if (urlSearch !== null) {
      dispatch(setSearch(urlSearch));
    }
  }, [urlFilter, urlSearch, dispatch]);

  const filteredDevices = useMemo(() => {
    return items.filter((device) => {
      const hostname = device.hostname ?? "";
      const statusMatch = filter === "all" || device.status === filter;
      const searchMatch =
        search === "" ||
        hostname.toLowerCase().includes(search.toLowerCase()) ||
        device.ipAddress?.includes(search);
      return statusMatch && searchMatch;
    });
  }, [items, filter, search]);

  const handleAddDevice = async (device: Partial<Device>) => {
    try {
      await createDevice(device);
      dispatch(fetchDevices());
    } catch (error) {
      console.error("Failed to add device:", error);
    }
  };

  const handleDeleteDevice = async (id: number) => {
    try {
      await import("@/lib/api").then((api) => api.deleteDevice(id));
      dispatch(deleteDevice(id));
    } catch (error) {
      console.error("Failed to delete device:", error);
    }
  };

  const onlineCount = items.filter((d) => d.status === "online").length;
  const offlineCount = items.filter((d) => d.status === "offline").length;
  const warningCount = items.filter((d) => d.status === "warning").length;
  const totalCount = items.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground">Manage your network inventory</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="px-2 py-1 rounded font-medium text-gray-700 bg-gray-100">
              Total: {totalCount}
            </span>
            <span className={`px-2 py-1 rounded font-medium ${getStatusColor("online")}`}>
              Online: {onlineCount}
            </span>
            <span className={`px-2 py-1 rounded font-medium ${getStatusColor("offline")}`}>
              Offline: {offlineCount}
            </span>
            <span className={`px-2 py-1 rounded font-medium ${getStatusColor("warning")}`}>
              Warning: {warningCount}
            </span>
          </div>
        </div>
        <AddDeviceDialog onAdd={handleAddDevice} />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            className="pl-9"
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
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
            <SelectItem value="offline">Offline Devices</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading devices...</div>
      ) : filteredDevices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {filter === "online"
            ? "No devices are online."
            : filter === "offline"
            ? "No devices are offline."
            : "No devices found."}
        </div>
      ) : (
        <DeviceGrid devices={filteredDevices} onDelete={handleDeleteDevice} />
      )}
    </div>
  );
}
