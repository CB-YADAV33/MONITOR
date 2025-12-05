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
  ipAddress: z.string().ip("Invalid IP address"),
  deviceType: z.string().min(1, "Device type is required"),
  snmpVersion: z.string().optional(),
  snmpCommunity: z.string().optional(),
  sshUsername: z.string().optional(),
  sshPassword: z.string().optional(),
});

interface AddDeviceDialogProps {
  onAdd: (device: Partial<Device>) => void;
}

export function AddDeviceDialog({ onAdd }: AddDeviceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failure' | null>(null);

  const form = useForm<z.infer<typeof deviceSchema>>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      hostname: "",
      ipAddress: "",
      deviceType: "Switch",
      snmpVersion: "v2c",
      snmpCommunity: "public",
    },
  });

  const onTest = async () => {
    const isValid = await form.trigger(['ipAddress']);
    if (!isValid) return;

    setIsTesting(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult(Math.random() > 0.3 ? 'success' : 'failure');
    }, 1500);
  };

  const onSubmit = (values: z.infer<typeof deviceSchema>) => {
    const newDevice: Partial<Device> = {
      hostname: values.hostname,
      ipAddress: values.ipAddress,
      deviceType: values.deviceType,
      snmpVersion: values.snmpVersion,
      snmpCommunity: values.snmpCommunity,
      sshUsername: values.sshUsername,
      sshPassword: values.sshPassword,
      sshEnabled: !!values.sshUsername,
      status: testResult === 'success' ? 'online' : 'unknown',
    };

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
                  name="ipAddress"
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
                <FormField
                  control={form.control}
                  name="deviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Device Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Router">Router</SelectItem>
                          <SelectItem value="Switch">Switch</SelectItem>
                          <SelectItem value="Firewall">Firewall</SelectItem>
                          <SelectItem value="AccessPoint">Access Point</SelectItem>
                          <SelectItem value="Server">Server</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="snmp" className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="snmpVersion"
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
                  name="snmpCommunity"
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
                  name="sshUsername"
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
                  name="sshPassword"
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
