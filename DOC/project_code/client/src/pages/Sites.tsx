import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SITES } from '@/lib/mockData';
import { MapPin, Server, Activity } from "lucide-react";

export default function Sites() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
        <p className="text-muted-foreground">Geographical distribution</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_SITES.map((site) => (
          <Card key={site.id} className="hover:bg-muted/20 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {site.site_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{site.location}</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Server className="h-4 w-4" /> Devices
                  </span>
                  <span className="font-bold">12</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-4 w-4" /> Status
                  </span>
                  <span className="text-green-500 font-medium">Healthy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
