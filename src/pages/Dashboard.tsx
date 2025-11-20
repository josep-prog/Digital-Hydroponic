import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, TrendingUp, Droplet, Thermometer } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalData: 0,
    avgTemp: 0,
    avgPH: 0,
    messagesCount: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const { data: farmingData } = await supabase
        .from("farming_data")
        .select("temperature, ph_level");

      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });

      if (farmingData) {
        const avgTemp =
          farmingData.reduce((acc, d) => acc + (d.temperature || 0), 0) / farmingData.length || 0;
        const avgPH =
          farmingData.reduce((acc, d) => acc + (d.ph_level || 0), 0) / farmingData.length || 0;

        setStats({
          totalData: farmingData.length,
          avgTemp: parseFloat(avgTemp.toFixed(1)),
          avgPH: parseFloat(avgPH.toFixed(2)),
          messagesCount: messagesCount || 0,
        });
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: "Data Points",
      value: stats.totalData,
      icon: TrendingUp,
      description: "Total measurements recorded",
      color: "text-chart-1",
    },
    {
      title: "Avg Temperature",
      value: `${stats.avgTemp}°C`,
      icon: Thermometer,
      description: "Across all readings",
      color: "text-chart-4",
    },
    {
      title: "Avg pH Level",
      value: stats.avgPH,
      icon: Droplet,
      description: "Soil acidity measure",
      color: "text-chart-2",
    },
    {
      title: "Community Messages",
      value: stats.messagesCount,
      icon: Sprout,
      description: "Total platform messages",
      color: "text-chart-5",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome to your farming intelligence hub
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors">
              <p className="font-medium text-foreground">View Daily Summary</p>
              <p className="text-sm text-muted-foreground">Check today's recommendations</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors">
              <p className="font-medium text-foreground">Analyze Data</p>
              <p className="text-sm text-muted-foreground">Review your farm metrics</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors">
              <p className="font-medium text-foreground">Community Chat</p>
              <p className="text-sm text-muted-foreground">Connect with other farmers</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current platform health</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Database</span>
              <span className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-medium">Active</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Messaging</span>
              <span className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-medium">Active</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Authentication</span>
              <span className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-primary font-medium">Active</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
