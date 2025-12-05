import { useState, useEffect } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const generateData = () => {
  const data = [];
  const now = new Date();
  for (let i = 60; i >= 0; i--) {
    data.push({
      time: new Date(now.getTime() - i * 1000).toLocaleTimeString([], { hour12: false }),
      in: Math.floor(Math.random() * 5000) + 2000,
      out: Math.floor(Math.random() * 3000) + 1000,
    });
  }
  return data;
};

export function BandwidthChart() {
  const [data, setData] = useState(generateData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour12: false }),
          in: Math.floor(Math.random() * 5000) + 2000,
          out: Math.floor(Math.random() * 3000) + 1000,
        };
        return [...prev.slice(1), newPoint];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Aggregate Network Traffic (Mbps)</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                minTickGap={30}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value} Mbps`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)' 
                }}
                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
              <Area 
                type="monotone" 
                dataKey="in" 
                stroke="hsl(var(--chart-1))" 
                fillOpacity={1} 
                fill="url(#colorIn)" 
                strokeWidth={2}
                name="Inbound"
                animationDuration={300}
              />
              <Area 
                type="monotone" 
                dataKey="out" 
                stroke="hsl(var(--chart-2))" 
                fillOpacity={1} 
                fill="url(#colorOut)" 
                strokeWidth={2}
                name="Outbound"
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
