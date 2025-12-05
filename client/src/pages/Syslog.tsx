import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock Syslog Data
const MOCK_SYSLOG = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  timestamp: new Date(Date.now() - i * 60000).toISOString(),
  facility: ['local0', 'kern', 'auth', 'daemon'][Math.floor(Math.random() * 4)],
  severity: ['info', 'warning', 'err', 'debug'][Math.floor(Math.random() * 4)],
  host: `10.1.1.${Math.floor(Math.random() * 20)}`,
  message: `Process ${['sshd', 'nginx', 'kernel', 'snmpd'][Math.floor(Math.random() * 4)]} reported status code ${Math.floor(Math.random() * 500)}`
}));

export default function Syslog() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Syslog Viewer</h1>
          <p className="text-muted-foreground">Centralized log management</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4 p-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search logs (regex supported)..." className="pl-9" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="err">Error</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md border-t border-b font-mono text-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[100px]">Severity</TableHead>
                  <TableHead className="w-[100px]">Facility</TableHead>
                  <TableHead className="w-[150px]">Host</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_SYSLOG.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        log.severity === 'err' ? "text-red-500 border-red-500" :
                        log.severity === 'warning' ? "text-orange-500 border-orange-500" :
                        "text-blue-500 border-blue-500"
                      }>
                        {log.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.facility}</TableCell>
                    <TableCell>{log.host}</TableCell>
                    <TableCell className="truncate max-w-md">{log.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
