import { Crosshair } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Crosshair className="mx-auto mb-4 h-16 w-16 text-primary animate-pulse-glow" />
        <h1 className="font-mono text-4xl font-bold tracking-wider text-primary">
          IWTS DASHBOARD
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Welcome, Instructor. System operational.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
