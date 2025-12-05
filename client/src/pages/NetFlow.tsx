import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

const PROTOCOL_DATA = [
  { name: 'HTTPS', value: 450, color: 'hsl(var(--chart-1))' },
  { name: 'SSH', value: 120, color: 'hsl(var(--chart-2))' },
  { name: 'SNMP', value: 80, color: 'hsl(var(--chart-3))' },
  { name: 'DNS', value: 50, color: 'hsl(var(--chart-4))' },
  { name: 'Other', value: 30, color: 'hsl(var(--chart-5))' },
];

const TOP_TALKERS = [
  { ip: '10.1.1.45', traffic: 2400 },
  { ip: '10.2.1.12', traffic: 1800 },
  { ip: '10.1.1.5', traffic: 1200 },
  { ip: '192.168.1.100', traffic: 900 },
  { ip: '10.3.4.22', traffic: 600 },
];

export default function NetFlow() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NetFlow Analytics</h1>
        <p className="text-muted-foreground">Traffic composition and top talkers</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Protocol Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PROTOCOL_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {PROTOCOL_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                     itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              {PROTOCOL_DATA.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Talkers (MB)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TOP_TALKERS} layout="vertical" margin={{ left: 40 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="ip" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                     cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                     contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                     itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Bar dataKey="traffic" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
