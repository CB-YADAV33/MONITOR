import { Switch, Route } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Devices from "@/pages/Devices";
import DeviceDetail from "@/pages/DeviceDetail";
import Topology from "@/pages/Topology";
import Alerts from "@/pages/Alerts";
import Syslog from "@/pages/Syslog";
import NetFlow from "@/pages/NetFlow";
import Sites from "@/pages/Sites";
import NotFound from "@/pages/not-found";
import MacAlarms from "@/pages/MacAlarms";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/devices" component={Devices} />
        <Route path="/devices/:id" component={DeviceDetail} />
        <Route path="/topology" component={Topology} />
        <Route path="/alerts" component={Alerts} />
        <Route path="/syslog" component={Syslog} />
        <Route path="/netflow" component={NetFlow} />
        <Route path="/sites" component={Sites} />

        {/* ✅ FIX: Add MAC alarms BEFORE NotFound */}
        <Route path="/mac-alarms" component={MacAlarms} />

        {/* ⛔ Catch-all must be last */}
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return <Router />;
}

export default App;
