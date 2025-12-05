import { pgTable, serial, varchar, text, timestamp, integer, bigint, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 100 }).notNull(),
  location: varchar("location", { length: 200 }),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  hostname: varchar("hostname", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 50 }).unique().notNull(),
  siteId: integer("site_id").references(() => sites.id, { onDelete: "set null" }),
  deviceType: varchar("device_type", { length: 50 }).notNull(),
  vendor: varchar("vendor", { length: 50 }).default("Cisco"),
  model: varchar("model", { length: 100 }),
  osVersion: varchar("os_version", { length: 100 }),
  snmpVersion: varchar("snmp_version", { length: 10 }),
  snmpCommunity: varchar("snmp_community", { length: 100 }),
  status: varchar("status", { length: 20 }).default("unknown"),
  lastSeen: timestamp("last_seen"),
  sshEnabled: boolean("ssh_enabled").default(false),
  sshUsername: varchar("ssh_username", { length: 100 }),
  sshPassword: varchar("ssh_password", { length: 200 }),
  sshPort: integer("ssh_port").default(22),
});

export const interfaces = pgTable("interfaces", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").references(() => devices.id, { onDelete: "cascade" }),
  interfaceName: varchar("interface_name", { length: 100 }),
  description: varchar("description", { length: 200 }),
  macAddress: varchar("mac_address", { length: 50 }),
  status: varchar("status", { length: 20 }),
  speedBps: bigint("speed_bps", { mode: "number" }),
  mtu: integer("mtu"),
});

export const interfaceStats = pgTable("interface_stats", {
  id: serial("id").primaryKey(),
  interfaceId: integer("interface_id").references(() => interfaces.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow(),
  inBps: bigint("in_bps", { mode: "number" }),
  outBps: bigint("out_bps", { mode: "number" }),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").references(() => devices.id, { onDelete: "cascade" }),
  interfaceId: integer("interface_id").references(() => interfaces.id, { onDelete: "cascade" }),
  alertType: varchar("alert_type", { length: 50 }),
  severity: varchar("severity", { length: 20 }),
  message: text("message"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const topologyLinks = pgTable("topology_links", {
  id: serial("id").primaryKey(),
  srcDeviceId: integer("src_device_id").references(() => devices.id, { onDelete: "cascade" }),
  srcInterface: varchar("src_interface", { length: 100 }),
  dstDeviceId: integer("dst_device_id").references(() => devices.id, { onDelete: "cascade" }),
  dstInterface: varchar("dst_interface", { length: 100 }),
  lastSeen: timestamp("last_seen").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 100 }),
  passwordHash: varchar("password_hash", { length: 200 }),
  role: varchar("role", { length: 20 }).default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sitesRelations = relations(sites, ({ many }) => ({
  devices: many(devices),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  site: one(sites, {
    fields: [devices.siteId],
    references: [sites.id],
  }),
  interfaces: many(interfaces),
  alerts: many(alerts),
}));

export const interfacesRelations = relations(interfaces, ({ one, many }) => ({
  device: one(devices, {
    fields: [interfaces.deviceId],
    references: [devices.id],
  }),
  stats: many(interfaceStats),
  alerts: many(alerts),
}));

export const interfaceStatsRelations = relations(interfaceStats, ({ one }) => ({
  interface: one(interfaces, {
    fields: [interfaceStats.interfaceId],
    references: [interfaces.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  device: one(devices, {
    fields: [alerts.deviceId],
    references: [devices.id],
  }),
  interface: one(interfaces, {
    fields: [alerts.interfaceId],
    references: [interfaces.id],
  }),
}));

export const insertSiteSchema = createInsertSchema(sites);
export const selectSiteSchema = createSelectSchema(sites);
export const insertDeviceSchema = createInsertSchema(devices);
export const selectDeviceSchema = createSelectSchema(devices);
export const insertInterfaceSchema = createInsertSchema(interfaces);
export const selectInterfaceSchema = createSelectSchema(interfaces);
export const insertInterfaceStatSchema = createInsertSchema(interfaceStats);
export const selectInterfaceStatSchema = createSelectSchema(interfaceStats);
export const insertAlertSchema = createInsertSchema(alerts);
export const selectAlertSchema = createSelectSchema(alerts);
export const insertTopologyLinkSchema = createInsertSchema(topologyLinks);
export const selectTopologyLinkSchema = createSelectSchema(topologyLinks);
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export type Site = typeof sites.$inferSelect;
export type InsertSite = typeof sites.$inferInsert;
export type Device = typeof devices.$inferSelect;
export type InsertDevice = typeof devices.$inferInsert;
export type Interface = typeof interfaces.$inferSelect;
export type InsertInterface = typeof interfaces.$inferInsert;
export type InterfaceStat = typeof interfaceStats.$inferSelect;
export type InsertInterfaceStat = typeof interfaceStats.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;
export type TopologyLink = typeof topologyLinks.$inferSelect;
export type InsertTopologyLink = typeof topologyLinks.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
