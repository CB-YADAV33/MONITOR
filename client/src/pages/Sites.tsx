import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Server, Activity, Plus } from "lucide-react";
import { getSites } from '@/lib/api';
import { Site } from '@/lib/types';

export default function Sites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSites = async () => {
      try {
        const data = await getSites();
        setSites(data);
      } catch (error) {
        console.error('Failed to load sites:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSites();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
          <p className="text-muted-foreground">Geographical distribution</p>
        </div>
        <div className="text-center py-8 text-muted-foreground">Loading sites...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sites</h1>
          <p className="text-muted-foreground">Geographical distribution</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Site
        </Button>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No sites found. Add your first site to get started.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sites.map((site) => (
            <Card key={site.id} className="hover:bg-muted/20 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {site.siteName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{site.location || 'No location set'}</p>
                <p className="text-sm text-muted-foreground">{site.description || 'No description'}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
