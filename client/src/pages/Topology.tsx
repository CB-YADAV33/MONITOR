import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RefreshCw, Move } from 'lucide-react';
import { getTopology, getDevices } from '@/lib/api';
import { Device } from '@/lib/types';

interface TopologyData {
  nodes: Array<{
    id: number;
    label: string;
    type: string;
    status: string | null;
    ipAddress: string;
  }>;
  edges: Array<{
    id: number;
    source: number;
    target: number;
    sourceInterface: string | null;
    targetInterface: string | null;
  }>;
}

export default function Topology() {
  const [zoom, setZoom] = useState(1);
  const [topology, setTopology] = useState<TopologyData | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopology();
  }, []);

  const loadTopology = async () => {
    setLoading(true);
    try {
      const [topoData, devicesData] = await Promise.all([
        getTopology(),
        getDevices()
      ]);
      setTopology(topoData);
      setDevices(devicesData);
    } catch (error) {
      console.error('Failed to load topology:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNodePosition = (index: number, total: number) => {
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    const angle = (2 * Math.PI * index) / total - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };

  const nodes = topology?.nodes || [];
  const edges = topology?.edges || [];

  const nodePositions = nodes.reduce((acc, node, index) => {
    acc[node.id] = getNodePosition(index, nodes.length);
    return acc;
  }, {} as Record<number, { x: number; y: number }>);

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
          <Button variant="outline" onClick={loadTopology}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Rediscover
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden bg-muted/10 relative border-2 border-dashed min-h-[500px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Loading topology...
          </div>
        ) : nodes.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No topology data available. Add devices and links to see the network map.
          </div>
        ) : (
          <div 
            className="absolute inset-0 transition-transform duration-200 ease-out origin-center"
            style={{ transform: `scale(${zoom})` }}
          >
            <svg className="w-full h-full pointer-events-none">
              {edges.map((edge) => {
                const srcPos = nodePositions[edge.source];
                const dstPos = nodePositions[edge.target];
                if (!srcPos || !dstPos) return null;
                
                return (
                  <g key={edge.id}>
                    <line 
                      x1={srcPos.x} 
                      y1={srcPos.y} 
                      x2={dstPos.x} 
                      y2={dstPos.y} 
                      stroke="hsl(var(--border))"
                      strokeWidth="2" 
                    />
                    <circle cx={(srcPos.x + dstPos.x)/2} cy={(srcPos.y + dstPos.y)/2} r="3" fill="hsl(var(--muted-foreground))" />
                  </g>
                );
              })}
            </svg>
            
            {nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              
              return (
                <div
                  key={node.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group"
                  style={{ left: pos.x, top: pos.y }}
                >
                  <div className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center bg-card shadow-lg transition-all group-hover:scale-110
                    ${node.status === 'online' ? 'border-green-500 shadow-green-500/20' : 
                      node.status === 'warning' ? 'border-orange-500 shadow-orange-500/20' : 
                      'border-red-500 shadow-red-500/20'}
                  `}>
                    <span className="text-xs font-bold text-foreground">{node.type?.[0] || '?'}</span>
                  </div>
                  <div className="mt-2 bg-card/80 backdrop-blur px-2 py-1 rounded text-xs font-medium border shadow-sm whitespace-nowrap">
                    {node.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{node.ipAddress}</div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
