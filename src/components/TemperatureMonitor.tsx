import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Thermometer, TrendingUp, Activity } from "lucide-react";
import {
  getLatestTemperatures,
  getTemperatureStats,
  subscribeToTemperatureChanges,
  DatabaseTemperatureRecord,
} from "@/services/temperatureService";
import { useToast } from "@/hooks/use-toast";

interface TemperatureStats {
  avg: number;
  min: number;
  max: number;
  count: number;
}

export const TemperatureMonitor = () => {
  const { toast } = useToast();
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [stats, setStats] = useState<TemperatureStats | null>(null);
  const [readings, setReadings] = useState<DatabaseTemperatureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get latest temperature readings
        const tempReadings = await getLatestTemperatures(10);
        setReadings(tempReadings);

        if (tempReadings.length > 0) {
          setCurrentTemp(tempReadings[0].temperature);
          setLastUpdated(new Date(tempReadings[0].recorded_at));
        }

        // Get statistics for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tempStats = await getTemperatureStats(today, tomorrow);
        setStats(tempStats);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching temperature data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch temperature data",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time temperature changes
    const unsubscribe = subscribeToTemperatureChanges((newData) => {
      setCurrentTemp(newData.temperature);
      setLastUpdated(new Date(newData.recorded_at));

      // Add new reading to the list
      setReadings((prev) => [newData, ...prev.slice(0, 9)]);

      toast({
        title: "New Temperature Reading",
        description: `Temperature: ${newData.temperature}°C`,
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const getTemperatureColor = (temp: number | null) => {
    if (temp === null) return "text-gray-500";
    if (temp < 10) return "text-blue-500";
    if (temp < 20) return "text-cyan-500";
    if (temp < 30) return "text-green-500";
    if (temp < 40) return "text-orange-500";
    return "text-red-500";
  };

  const getTemperatureBadgeVariant = (temp: number | null) => {
    if (temp === null) return "secondary";
    if (temp < 15) return "default";
    if (temp < 30) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Current Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse h-12 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
      {/* Current Temperature Card */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Current Temperature
            </CardTitle>
            <Thermometer className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className={`text-4xl font-bold ${getTemperatureColor(currentTemp)}`}>
            {currentTemp !== null ? `${currentTemp.toFixed(1)}°C` : "N/A"}
          </div>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Badge variant={getTemperatureBadgeVariant(currentTemp)}>
            {currentTemp !== null
              ? currentTemp < 15
                ? "🥶 Cold"
                : currentTemp < 30
                ? "✓ Optimal"
                : "🔥 Hot"
              : "No Data"}
          </Badge>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      {stats && (
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Today's Statistics
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Average</p>
              <p className="text-2xl font-semibold">
                {stats.avg.toFixed(1)}°C
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Min</p>
                <p className="text-lg font-semibold text-blue-500">
                  {stats.min.toFixed(1)}°C
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max</p>
                <p className="text-lg font-semibold text-red-500">
                  {stats.max.toFixed(1)}°C
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.count} readings today
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sensor Status Card */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Sensor Status
            </CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Sensor Active</span>
                </div>
                {readings.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Last {readings.length} readings recorded
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Recent Readings Card */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">
            Recent Readings
          </CardTitle>
          <CardDescription>
            Last 10 temperature recordings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {readings.length > 0 ? (
              readings.map((reading, index) => (
                <div
                  key={reading.id}
                  className="flex items-center justify-between p-2 rounded border border-border"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <span className={`font-semibold ${getTemperatureColor(reading.temperature)}`}>
                      {reading.temperature.toFixed(1)}°C
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(reading.recorded_at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No readings available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemperatureMonitor;
