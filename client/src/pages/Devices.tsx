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

/* -------------------------------------------
  🔧 Custom Hook: Safe URL Search Params
-------------------------------------------- */
function useSearchParams() {
  const [location] = useLocation();
  return new URLSearchParams(location.split("?")[1] || "");
}

export default function Devices() {
  const dispatch = useDispatch<AppDispatch>();

  const { items, filter, search, loading } = useSelector(
    (state: RootState) => state.devices
  );

  const searchParams = useSearchParams();
  const urlFilter = searchParams.get("filter");
  const urlSearch = searchParams.get("search");

  /* -------------------------
    Fetch devices on mount
  -------------------------- */
  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  /* -------------------------------------------
    🔄 Sync URL → Redux store (filter + search)
  -------------------------------------------- */
  useEffect(() => {
    if (urlFilter && ["online", "offline", "warning", "all"].includes(urlFilter)) {
      dispatch(setFilter(urlFilter));
    }

    if (urlSearch !== null) {
      dispatch(setSearch(urlSearch));
    }
  }, [urlFilter, urlSearch, dispatch]);

  /* -------------------------------------------
    🔍 Filter Logic (Safe hostname handling)
  -------------------------------------------- */
  const filteredDevices = useMemo(() => {
    return items.filter((device) => {
      const hostname = device.hostname ?? ""; // avoid null errors

      const statusMatch =
        filter === "all" || device.status === filter;

      const searchMatch =
        search === "" ||
        hostname.toLowerCase().includes(search.toLowerCase()) ||
        device.ipAddress?.includes(search);

      return statusMatch && searchMatch;
    });
  }, [items, filter, search]);

  /* --------------------------
    Add Device Handler
  --------------------------- */
  const handleAddDevice = async (device: Partial<Device>) => {
    try {
      await createDevice(device);
      dispatch(fetchDevices());
    } catch (error) {
      console.error("Failed to add device:", error);
    }
  };

  /* --------------------------
    Delete Device Handler
  --------------------------- */
  const handleDeleteDevice = async (id: number) => {
    try {
      await import("@/lib/api").then((api) => api.deleteDevice(id));
      dispatch(deleteDevice(id));
    } catch (error) {
      console.error("Failed to delete device:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devices</h1>
          <p className="text-muted-foreground">Manage your network inventory</p>
        </div>
        <AddDeviceDialog onAdd={handleAddDevice} />
      </div>

      {/* FILTER BAR */}
      <div className="flex items-center gap-4">
        {/* SEARCH INPUT */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search devices..."
            className="pl-9"
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
          />
        </div>

        {/* STATUS DROPDOWN */}
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

      {/* DEVICE GRID */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading devices...
        </div>
      ) : (
        <DeviceGrid devices={filteredDevices} onDelete={handleDeleteDevice} />
      )}
    </div>
  );
}
