export interface Site {
  id: number;
  site_name: string;
  location: string;
  description: string;
  created_at: string;
}

export interface Device {
  id: number;
  hostname: string;
  ip_address: string;
  site_id: number | null;
  device_type: 'Router' | 'Switch' | 'Firewall' | 'AccessPoint' | 'Server' | 'Unknown';
  vendor: string;
  model: string;
  os_version: string;
  snmp_version: 'v2c' | 'v3';
  snmp_community?: string;
  status: 'online' | 'offline' | 'warning' | 'unknown';
  last_seen: string;
  ssh_enabled: boolean;
  ssh_port: number;
  cpu_usage: number; // Mocked real-time
  memory_usage: number; // Mocked real-time
  uptime: string;
}

export interface NetworkInterface {
  id: number;
  device_id: number;
  interface_name: string;
  description: string;
  mac_address: string;
  status: 'up' | 'down';
  speed_bps: number;
  mtu: number;
  in_bps: number; // Real-time
  out_bps: number; // Real-time
  duplex: 'Full' | 'Half' | 'Auto';
  admin_status: 'up' | 'down';
  oper_status: 'up' | 'down';
}

export interface Alert {
  id: number;
  device_id: number;
  interface_id?: number;
  alert_type: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface TopologyLink {
  id: number;
  src_device_id: number;
  src_interface: string;
  dst_device_id: number;
  dst_interface: string;
  status: 'active' | 'down';
}

export interface SyslogEntry {
  id: number;
  device_id: number;
  severity: number; // 0-7
  message: string;
  timestamp: string;
  facility: string;
}
