import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NetworkInterface } from "@/lib/types";
import { ArrowDown, ArrowUp } from "lucide-react";

interface InterfaceTableProps {
  interfaces: NetworkInterface[];
}

export function InterfaceTable({ interfaces }: InterfaceTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Interface</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Inbound</TableHead>
            <TableHead className="text-right">Outbound</TableHead>
            <TableHead>Duplex</TableHead>
            <TableHead>MAC Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {interfaces.map((iface) => (
            <TableRow key={iface.id}>
              <TableCell className="font-medium font-mono">{iface.interface_name}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Badge variant="outline" className={iface.oper_status === 'up' ? "text-green-500 border-green-500" : "text-red-500 border-red-500"}>
                    {iface.oper_status.toUpperCase()}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-xs truncate max-w-[200px]">
                {iface.description}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {iface.oper_status === 'up' ? (
                  <span className="flex items-center justify-end gap-1 text-green-500">
                    <ArrowDown className="h-3 w-3" />
                    {(iface.in_bps / 1000000).toFixed(1)} Mbps
                  </span>
                ) : '-'}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {iface.oper_status === 'up' ? (
                  <span className="flex items-center justify-end gap-1 text-blue-500">
                    <ArrowUp className="h-3 w-3" />
                    {(iface.out_bps / 1000000).toFixed(1)} Mbps
                  </span>
                ) : '-'}
              </TableCell>
              <TableCell className="text-xs">{iface.duplex}</TableCell>
              <TableCell className="text-xs font-mono text-muted-foreground">{iface.mac_address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
