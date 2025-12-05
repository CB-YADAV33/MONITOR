import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, CheckCircle, XCircle } from "lucide-react";
import { Device } from "@/lib/types";

const deviceSchema = z.object({
  hostname: z.string().min(2, "Hostname must be at least 2 characters"),
  ip_address: z.string().ip("Invalid IP address"),
  snmp_version: z.enum(["v2c", "v3"]),
  snmp_community: z.string().optional(),
  ssh_username: z.string().optional(),
  ssh_password: z.string().optional(),
});

interface AddDeviceDialogProps {
  onAdd: (device: Device) => void;
}

export function AddDeviceDialog({ onAdd }: AddDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failure' | null>(null);

  const form = useForm<z.infer<typeof deviceSchema>>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      hostname: "",
      ip_address: "",
      snmp_version: "v2c",
      snmp_community: "public",
    },
  });

  const onTest = async () => {
    const isValid = await form.trigger(['ip_address']);
    if (!isValid) return;

    setIsTesting(true);
    setTestResult(null);
    // Mock testing delay
    setTimeout(() => {
      setIsTesting(false);
      setTestResult(Math.random() > 0.3 ? 'success' : 'failure');
    }, 1500);
  };

  const onSubmit = (values: z.infer<typeof deviceSchema>) => {
    // Mock device creation
    const newDevice: Device = {
      id: Math.floor(Math.random() * 10000),
      hostname: values.hostname,
      ip_address: values.ip_address,
      site_id: 1,
      device_type: 'Unknown', // Would be determined by backend
      vendor: 'Unknown',
      model: 'Unknown',
      os_version: 'Unknown',
      snmp_version: values.snmp_version,
      status: 'unknown',
      last_seen: new Date().toISOString(),
      ssh_enabled: !!values.ssh_username,
      ssh_port: 22,
      cpu_usage: 0,
      memory_usage: 0,
      uptime: '0m'
    };

    // Simulate auto-classification based on mock test
    if (testResult === 'success') {
        newDevice.device_type = 'Switch';
        newDevice.vendor = 'Cisco';
        newDevice.model = 'Catalyst 9200';
        newDevice.status = 'online';
    }

    onAdd(newDevice);
    setOpen(false);
    form.reset();
    setTestResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
          <DialogDescription>
            Enter device details. The system will attempt to auto-classify the device via SNMP.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="snmp">SNMP</TabsTrigger>
                <TabsTrigger value="ssh">SSH</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="hostname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hostname</FormLabel>
                      <FormControl>
                        <Input placeholder="CORE-RTR-01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ip_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Address</FormLabel>
                      <FormControl>
                        <Input placeholder="192.168.1.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="snmp" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="snmp_version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SNMP Version</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select version" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="v2c">v2c</SelectItem>
                          <SelectItem value="v3">v3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="snmp_community"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community String</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="public" {...field} />
                      </FormControl>
                      <FormDescription>For v2c only.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="ssh" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="ssh_username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ssh_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onTest} disabled={isTesting}>
                  {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Test Connectivity
                </Button>
                {testResult === 'success' && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Reachable
                  </span>
                )}
                {testResult === 'failure' && (
                  <span className="text-sm text-red-600 flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Unreachable
                  </span>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Add Device</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
