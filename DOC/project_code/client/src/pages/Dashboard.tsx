import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { BandwidthChart } from '@/components/dashboard/BandwidthChart';
import { AlertsFeed } from '@/components/dashboard/AlertsFeed';

export default function Dashboard() {
  const devices = useSelector((state: RootState) => state.devices.items);
  const alerts = useSelector((state: RootState) => state.alerts.items);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Overview</h1>
          <p className="text-muted-foreground">System status and key performance indicators</p>
        </div>
      </div>
      
      <StatsCards devices={devices} alerts={alerts} />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <BandwidthChart />
        <AlertsFeed alerts={alerts} />
      </div>
    </div>
  );
}
