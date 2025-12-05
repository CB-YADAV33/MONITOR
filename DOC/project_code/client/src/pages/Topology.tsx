import { useState } from 'react';
import { MOCK_DEVICES, MOCK_TOPOLOGY } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RefreshCw, Move } from 'lucide-react';

// Simple force-directed layout simulation (static for mockup)
const NODES = [
  { id: 1, x: 400, y: 100, type: 'Router' },
  { id: 2, x: 200, y: 300, type: 'Switch' },
  { id: 3, x: 600, y: 300, type: 'Firewall' },
  { id: 4, x: 200, y: 500, type: 'Switch' },
  { id: 5, x: 600, y: 500, type: 'Switch' },
  { id: 6, x: 400, y: 500, type: 'Router' },
];

export default function Topology() {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Topology</h1>
          <p className="text-muted-foreground">Logical Layer 3 Map (LLDP/CDP)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Move className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Rediscover
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden bg-muted/10 relative border-2 border-dashed">
        <div 
          className="absolute inset-0 transition-transform duration-200 ease-out origin-center"
          style={{ transform: `scale(${zoom})` }}
        >
          <svg className="w-full h-full pointer-events-none">
            {/* Links */}
            {MOCK_TOPOLOGY.map((link) => {
              const src = NODES.find(n => n.id === link.src_device_id);
              const dst = NODES.find(n => n.id === link.dst_device_id);
              if (!src || !dst) return null;
              
              return (
                <g key={link.id}>
                  <line 
                    x1={src.x} 
                    y1={src.y} 
                    x2={dst.x} 
                    y2={dst.y} 
                    stroke={link.status === 'active' ? "hsl(var(--border))" : "red"} 
                    strokeWidth="2" 
                    strokeDasharray={link.status === 'active' ? "" : "5,5"}
                  />
                  <circle cx={(src.x + dst.x)/2} cy={(src.y + dst.y)/2} r="3" fill="hsl(var(--muted-foreground))" />
                </g>
              );
            })}
          </svg>
          
          {/* Nodes */}
          {NODES.map((node) => {
            const device = MOCK_DEVICES.find(d => d.id === node.id);
            if (!device) return null;
            
            return (
              <div
                key={node.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                style={{ left: node.x, top: node.y }}
              >
                <div className={`
                  w-12 h-12 rounded-full border-2 flex items-center justify-center bg-card shadow-lg transition-all group-hover:scale-110
                  ${device.status === 'online' ? 'border-green-500 shadow-green-500/20' : 
                    device.status === 'warning' ? 'border-orange-500 shadow-orange-500/20' : 
                    'border-red-500 shadow-red-500/20'}
                `}>
                  <span className="text-xs font-bold text-foreground">{device.device_type[0]}</span>
                </div>
                <div className="mt-2 bg-card/80 backdrop-blur px-2 py-1 rounded text-xs font-medium border shadow-sm whitespace-nowrap">
                  {device.hostname}
                </div>
                <div className="text-[10px] text-muted-foreground">{device.ip_address}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
