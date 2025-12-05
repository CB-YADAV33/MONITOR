import { Device, NetworkInterface, Alert, Site, TopologyLink } from './types';
import { subMinutes, subHours } from 'date-fns';

// Generators
const generateIP = () => `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
const generateMac = () => 'XX:XX:XX:XX:XX:XX'.replace(/X/g, () => '0123456789ABCDEF'.charAt(Math.floor(Math.random() * 16)));

export const MOCK_SITES: Site[] = [
  { id: 1, site_name: 'HQ - New York', location: 'New York, NY', description: 'Main Headquarters', created_at: new Date().toISOString() },
  { id: 2, site_name: 'Branch - London', location: 'London, UK', description: 'EMEA Regional Office', created_at: new Date().toISOString() },
  { id: 3, site_name: 'DC - Virginia', location: 'Ashburn, VA', description: 'Primary Data Center', created_at: new Date().toISOString() },
  { id: 4, site_name: 'Branch - Tokyo', location: 'Tokyo, JP', description: 'APAC Regional Office', created_at: new Date().toISOString() },
];

export const MOCK_DEVICES: Device[] = [
  {
    id: 1,
    hostname: 'CORE-RTR-01',
    ip_address: '10.1.1.1',
    site_id: 1,
    device_type: 'Router',
    vendor: 'Cisco',
    model: 'ASR 1001-X',
    os_version: '17.03.04',
    snmp_version: 'v3',
    status: 'online',
    last_seen: new Date().toISOString(),
    ssh_enabled: true,
    ssh_port: 22,
    cpu_usage: 45,
    memory_usage: 62,
    uptime: '45d 12h 30m'
  },
  {
    id: 2,
    hostname: 'DIST-SW-01',
    ip_address: '10.1.2.1',
    site_id: 1,
    device_type: 'Switch',
    vendor: 'Cisco',
    model: 'Catalyst 9500',
    os_version: '17.06.01',
    snmp_version: 'v2c',
    status: 'online',
    last_seen: new Date().toISOString(),
    ssh_enabled: true,
    ssh_port: 22,
    cpu_usage: 23,
    memory_usage: 40,
    uptime: '120d 4h 15m'
  },
  {
    id: 3,
    hostname: 'FW-EDGE-01',
    ip_address: '10.1.1.254',
    site_id: 1,
    device_type: 'Firewall',
    vendor: 'Palo Alto',
    model: 'PA-3220',
    os_version: '10.1.6',
    snmp_version: 'v3',
    status: 'warning',
    last_seen: new Date().toISOString(),
    ssh_enabled: true,
    ssh_port: 22,
    cpu_usage: 88,
    memory_usage: 75,
    uptime: '12d 1h 05m'
  },
  {
    id: 4,
    hostname: 'ACCESS-SW-05',
    ip_address: '10.1.10.5',
    site_id: 1,
    device_type: 'Switch',
    vendor: 'Cisco',
    model: 'Catalyst 9200',
    os_version: '17.03.01',
    snmp_version: 'v2c',
    status: 'offline',
    last_seen: subMinutes(new Date(), 15).toISOString(),
    ssh_enabled: true,
    ssh_port: 22,
    cpu_usage: 0,
    memory_usage: 0,
    uptime: '0m'
  },
  {
    id: 5,
    hostname: 'DC-CORE-01',
    ip_address: '10.3.1.1',
    site_id: 3,
    device_type: 'Switch',
    vendor: 'Cisco',
    model: 'Nexus 93180YC',
    os_version: '9.3(8)',
    snmp_version: 'v3',
    status: 'online',
    last_seen: new Date().toISOString(),
    ssh_enabled: true,
    ssh_port: 22,
    cpu_usage: 12,
    memory_usage: 30,
    uptime: '200d 11h 22m'
  },
  {
    id: 6,
    hostname: 'UK-RTR-01',
    ip_address: '10.2.1.1',
    site_id: 2,
    device_type: 'Router',
    vendor: 'Juniper',
    model: 'MX204',
    os_version: '21.4R1',
    snmp_version: 'v2c',
    status: 'online',
    last_seen: new Date().toISOString(),
    ssh_enabled: true,
    ssh_port: 22,
    cpu_usage: 35,
    memory_usage: 45,
    uptime: '50d 2h 10m'
  }
];

export const generateInterfaces = (deviceId: number): NetworkInterface[] => {
  const interfaces: NetworkInterface[] = [];
  const count = 12; // Generate 12 interfaces per device
  
  for (let i = 1; i <= count; i++) {
    const isUp = Math.random() > 0.1;
    interfaces.push({
      id: parseInt(`${deviceId}${i}`),
      device_id: deviceId,
      interface_name: `GigabitEthernet1/0/${i}`,
      description: `Link to Device ${i}`,
      mac_address: generateMac(),
      status: isUp ? 'up' : 'down',
      speed_bps: 1000000000,
      mtu: 1500,
      in_bps: isUp ? Math.floor(Math.random() * 800000000) : 0,
      out_bps: isUp ? Math.floor(Math.random() * 800000000) : 0,
      duplex: 'Full',
      admin_status: 'up',
      oper_status: isUp ? 'up' : 'down'
    });
  }
  return interfaces;
};

export const MOCK_ALERTS: Alert[] = [
  {
    id: 1,
    device_id: 3,
    alert_type: 'High CPU',
    severity: 'warning',
    message: 'CPU usage exceeded 85% for 5 minutes',
    timestamp: subMinutes(new Date(), 10).toISOString(),
    acknowledged: false
  },
  {
    id: 2,
    device_id: 4,
    alert_type: 'Device Down',
    severity: 'critical',
    message: 'ICMP Ping failed. Device unreachable.',
    timestamp: subMinutes(new Date(), 15).toISOString(),
    acknowledged: false
  },
  {
    id: 3,
    device_id: 1,
    alert_type: 'Interface Flapping',
    severity: 'info',
    message: 'Interface Gi1/0/2 state changed to down',
    timestamp: subHours(new Date(), 2).toISOString(),
    acknowledged: true
  }
];

export const MOCK_TOPOLOGY: TopologyLink[] = [
  { id: 1, src_device_id: 1, src_interface: 'Gi1/0/1', dst_device_id: 2, dst_interface: 'Gi1/0/48', status: 'active' },
  { id: 2, src_device_id: 1, src_interface: 'Gi1/0/2', dst_device_id: 3, dst_interface: 'Eth1/1', status: 'active' },
  { id: 3, src_device_id: 2, src_interface: 'Gi1/0/1', dst_device_id: 4, dst_interface: 'Gi1/0/24', status: 'down' },
  { id: 4, src_device_id: 3, src_interface: 'Eth1/2', dst_device_id: 5, dst_interface: 'Eth1/1', status: 'active' }
];
