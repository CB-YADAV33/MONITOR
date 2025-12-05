import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/lib/types";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AlertsFeedProps {
  alerts: Alert[];
}

export function AlertsFeed({ alerts }: AlertsFeedProps) {
  return (
    <Card className="col-span-3 h-full">
      <CardHeader>
        <CardTitle>Live Alerts Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-4 rounded-md border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className={cn(
                  "mt-0.5 rounded-full p-1",
                  alert.severity === 'critical' && "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
                  alert.severity === 'warning' && "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
                  alert.severity === 'info' && "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                )}>
                  {alert.severity === 'critical' && <AlertCircle className="h-4 w-4" />}
                  {alert.severity === 'warning' && <AlertTriangle className="h-4 w-4" />}
                  {alert.severity === 'info' && <Info className="h-4 w-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {alert.alertType}
                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                      on Device #{alert.deviceId}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {alert.message}
                  </p>
                  <p className="text-xs text-muted-foreground pt-1">
                    {alert.timestamp ? formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true }) : 'Unknown'}
                  </p>
                </div>
                <button className="text-xs font-medium text-primary hover:underline">
                  Ack
                </button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
