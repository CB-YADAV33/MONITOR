import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Device } from "@/lib/types";

interface DeviceStatsProps {
  device: Device;
}

// Mock historical data generator
const generateHistory = (baseValue: number, variance: number) => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: `${i}m ago`,
    value: Math.max(0, Math.min(100, baseValue + (Math.random() * variance - variance/2)))
  })).reverse();
};

export function DeviceStats({ device }: DeviceStatsProps) {
  const cpuData = generateHistory(device.cpu_usage, 20);
  const memData = generateHistory(device.memory_usage, 10);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">CPU Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-4">{device.cpu_usage}%</div>
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" fill="url(#colorCpu)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-4">{device.memory_usage}%</div>
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memData}>
                <defs>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" fill="url(#colorMem)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
