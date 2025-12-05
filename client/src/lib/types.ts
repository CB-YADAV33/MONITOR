export interface Site {
  id: number;
  siteName: string;
  location: string | null;
  description: string | null;
  createdAt: string | null;
}

export interface Device {
  id: number;
  hostname: string | null;
  ipAddress: string;
  siteId: number | null;
  deviceType: string;
  vendor: string | null;
  model: string | null;
  osVersion: string | null;
  snmpVersion: string | null;
  snmpCommunity: string | null;
  status: string | null;
  lastSeen: string | null;
  sshEnabled: boolean | null;
  sshUsername: string | null;
  sshPassword: string | null;
  sshPort: number | null;
}

export interface NetworkInterface {
  id: number;
  deviceId: number | null;
  interfaceName: string | null;
  description: string | null;
  macAddress: string | null;
  status: string | null; // 'up' | 'down' | 'unknown'
  speedBps: number | null; // interface speed in bits per second
  mtu: number | null;

  // Advanced stats
  inputErrors?: number | null;
  outputErrors?: number | null;
  crcErrors?: number | null;
  inBps?: number | null;  // real-time inbound traffic in bits per second
  outBps?: number | null; // real-time outbound traffic in bits per second
}

export interface InterfaceStat {
  id: number;
  interfaceId: number | null;
  timestamp: string | null;
  inBps: number | null;
  outBps: number | null;
}

export interface Alert {
  id: number;
  deviceId: number | null;
  interfaceId: number | null;
  alertType: string | null;
  severity: string | null;
  message: string | null;
  timestamp: string | null;
}

export interface TopologyLink {
  id: number;
  srcDeviceId: number | null;
  srcInterface: string | null;
  dstDeviceId: number | null;
  dstInterface: string | null;
  lastSeen: string | null;
}

export interface SyslogEntry {
  id: number;
  deviceId: number;
  severity: number;
  message: string;
  timestamp: string;
  facility: string;
}

export interface TopologyNode {
  id: string;
  data: {
    label: string;
    type: string;
    status: string | null;
    ipAddress: string;
    vendor: string | null;
    model: string | null;
  };
  position: { x: number; y: number };
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface TopologyGraph {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}
