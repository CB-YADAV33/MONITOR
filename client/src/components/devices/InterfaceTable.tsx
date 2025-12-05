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

interface InterfaceTableProps {
  interfaces: NetworkInterface[];
  showAdvanced?: boolean; // Optional prop to show extra stats
}

export function InterfaceTable({ interfaces, showAdvanced = false }: InterfaceTableProps) {
  if (interfaces.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        No interfaces found for this device.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Interface</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Speed</TableHead>
            <TableHead>MTU</TableHead>
            <TableHead>MAC Address</TableHead>
            {showAdvanced && (
              <>
                <TableHead>Input Errors</TableHead>
                <TableHead>Output Errors</TableHead>
                <TableHead>CRC</TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {interfaces.map((iface) => (
            <TableRow key={iface.id}>
              <TableCell className="font-medium font-mono">{iface.interfaceName || 'N/A'}</TableCell>

              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    iface.status === 'up'
                      ? "text-green-500 border-green-500"
                      : "text-red-500 border-red-500"
                  }
                >
                  {(iface.status || 'unknown').toUpperCase()}
                </Badge>
              </TableCell>

              <TableCell className="text-muted-foreground text-xs truncate max-w-[200px]">
                {iface.description || '-'}
              </TableCell>

              <TableCell className="font-mono text-xs">
                {iface.speedBps ? `${(iface.speedBps / 1000000).toFixed(0)} Mbps` : '-'}
              </TableCell>

              <TableCell className="text-xs">{iface.mtu || '-'}</TableCell>

              <TableCell className="text-xs font-mono text-muted-foreground">
                {iface.macAddress || '-'}
              </TableCell>

              {showAdvanced && (
                <>
                  <TableCell className="text-xs">{iface.inputErrors ?? 0}</TableCell>
                  <TableCell className="text-xs">{iface.outputErrors ?? 0}</TableCell>
                  <TableCell className="text-xs">{iface.crcErrors ?? 0}</TableCell>
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
