import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { acknowledgeAlert, clearAllAlerts } from '@/features/alerts/alertsSlice';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, AlertCircle, Info, CheckCircle, Trash2, Search, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Alerts() {
  const dispatch = useDispatch();
  const alerts = useSelector((state: RootState) => state.alerts.items);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground">System notifications and alarms</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => dispatch(clearAllAlerts())}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 flex flex-row items-center gap-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              className="pl-9"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[150px]">Severity</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No active alerts
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.id} className={alert.acknowledged ? "opacity-50 bg-muted/30" : ""}>
                    <TableCell>
                      {alert.severity === 'critical' && <AlertCircle className="h-5 w-5 text-red-500" />}
                      {alert.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                      {alert.severity === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        alert.severity === 'critical' ? "border-red-500 text-red-500" :
                        alert.severity === 'warning' ? "border-orange-500 text-orange-500" :
                        "border-blue-500 text-blue-500"
                      }>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{alert.alert_type}</div>
                      <div className="text-sm text-muted-foreground">{alert.message}</div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">Device #{alert.device_id}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      {!alert.acknowledged && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => dispatch(acknowledgeAlert(alert.id))}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
