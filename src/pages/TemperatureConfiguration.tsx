import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  testTemperatureAPI,
  testTemperatureAPIGet,
  simulateTemperatureReadings,
  validateConfig,
} from "@/utils/temperatureTestUtils";
import { recordTemperature, getLatestTemperatures } from "@/services/temperatureService";
import { AlertCircle, CheckCircle, Thermometer, Zap } from "lucide-react";

export default function TemperatureConfiguration() {
  const [apiEndpoint, setApiEndpoint] = useState(
    import.meta.env.VITE_TEMPERATURE_API_ENDPOINT || ""
  );
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_TEMPERATURE_API_KEY || "");
  const [userId, setUserId] = useState(import.meta.env.VITE_DEFAULT_USER_ID || "");
  const [temperature, setTemperature] = useState("25.5");
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleValidateConfig = () => {
    const validation = validateConfig({ apiEndpoint, apiKey, userId });
    setTestResults(validation);
  };

  const handleTestGet = async () => {
    if (!apiEndpoint) {
      setTestResults({ valid: false, errors: ["API Endpoint is required"] });
      return;
    }

    setLoading(true);
    try {
      const result = await testTemperatureAPIGet(apiEndpoint);
      setTestResults(result);
    } finally {
      setLoading(false);
    }
  };

  const handleTestPost = async () => {
    if (!apiEndpoint || !apiKey || !userId) {
      setTestResults({ valid: false, errors: ["All fields are required"] });
      return;
    }

    setLoading(true);
    try {
      const result = await testTemperatureAPI(
        apiEndpoint,
        apiKey,
        parseFloat(temperature),
        userId
      );
      setTestResults(result);
      if (result.success) {
        setSuccessMessage("✅ Temperature recorded successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    if (!apiEndpoint || !apiKey || !userId) {
      setTestResults({ valid: false, errors: ["All fields are required"] });
      return;
    }

    setLoading(true);
    try {
      await simulateTemperatureReadings(apiEndpoint, apiKey, userId, 5, 2000);
      setSuccessMessage("✅ Simulation completed!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordLocal = async () => {
    setLoading(true);
    try {
      const result = await recordTemperature(parseFloat(temperature));
      if (result) {
        setSuccessMessage("✅ Temperature recorded to local database!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setTestResults({
          valid: false,
          errors: ["Failed to record temperature"],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Temperature Recording Setup</h1>
        <p className="text-muted-foreground">
          Configure and test your temperature sensor API integration
        </p>
      </div>

      {successMessage && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Enter your temperature recording API details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">API Endpoint</Label>
              <Input
                id="endpoint"
                placeholder="https://your-project.supabase.co/functions/v1/record-temperature"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your Supabase Edge Function URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">API Key</Label>
              <Input
                id="key"
                type="password"
                placeholder="your-supabase-anon-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Your Supabase Anon Key</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="your-user-id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your Supabase user ID or default system user
              </p>
            </div>

            <Button onClick={handleValidateConfig} variant="outline" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Validate Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults && (
          <Alert variant={testResults.valid ? "default" : "destructive"}>
            {testResults.valid ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {testResults.valid ? "Configuration Valid" : "Configuration Issues"}
            </AlertTitle>
            <AlertDescription>
              {testResults.valid ? (
                <p>All required fields are properly configured.</p>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {testResults.errors?.map((error: string, idx: number) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Testing Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Test API Connection</CardTitle>
            <CardDescription>Test your configuration with different methods</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="test" className="space-y-4">
              <TabsList>
                <TabsTrigger value="test">Manual Test</TabsTrigger>
                <TabsTrigger value="simulate">Simulate Readings</TabsTrigger>
                <TabsTrigger value="local">Record Local</TabsTrigger>
                <TabsTrigger value="docs">API Docs</TabsTrigger>
              </TabsList>

              <TabsContent value="test" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="temp">Temperature (°C)</Label>
                  <Input
                    id="temp"
                    type="number"
                    placeholder="25.5"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    step="0.1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleTestGet}
                    disabled={loading}
                    variant="outline"
                  >
                    Test GET
                  </Button>
                  <Button onClick={handleTestPost} disabled={loading}>
                    <Thermometer className="h-4 w-4 mr-2" />
                    Record Temperature
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="simulate" className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Simulation Mode</AlertTitle>
                  <AlertDescription>
                    Generate 5 random temperature readings at 2-second intervals
                  </AlertDescription>
                </Alert>

                <Button onClick={handleSimulate} disabled={loading} className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Start Simulation
                </Button>
              </TabsContent>

              <TabsContent value="local" className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Local Database Recording</AlertTitle>
                  <AlertDescription>
                    Record directly to your Supabase database without going through the API
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="tempLocal">Temperature (°C)</Label>
                  <Input
                    id="tempLocal"
                    type="number"
                    placeholder="25.5"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    step="0.1"
                  />
                </div>

                <Button onClick={handleRecordLocal} disabled={loading} className="w-full">
                  <Thermometer className="h-4 w-4 mr-2" />
                  Record to Database
                </Button>
              </TabsContent>

              <TabsContent value="docs" className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm space-y-2">
                  <div>
                    <Badge>POST</Badge>
                    <span className="ml-2 text-xs text-muted-foreground">
                      /functions/v1/record-temperature
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="font-semibold text-xs mb-2">Request Body:</p>
                    <pre className="bg-white p-2 rounded border overflow-x-auto text-xs">
                      {JSON.stringify(
                        {
                          temperature: 25.5,
                          user_id: "your-user-id",
                          sensor_id: "sensor_001",
                          timestamp: new Date().toISOString(),
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>

                  <div className="mt-4">
                    <p className="font-semibold text-xs mb-2">Response:</p>
                    <pre className="bg-white p-2 rounded border overflow-x-auto text-xs">
                      {JSON.stringify(
                        {
                          success: true,
                          message: "Temperature recorded successfully",
                          data: {
                            id: "uuid",
                            temperature: 25.5,
                            ph_level: 6.5,
                            ec_level: 1.2,
                            recorded_at: new Date().toISOString(),
                          },
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Current Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">API Endpoint</p>
                <p className="text-xs font-mono truncate">
                  {apiEndpoint ? "✓ Configured" : "✗ Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">API Key</p>
                <p className="text-xs font-mono">
                  {apiKey ? "✓ Configured" : "✗ Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="text-xs font-mono">
                  {userId ? "✓ Configured" : "✗ Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={apiEndpoint && apiKey && userId ? "default" : "secondary"}>
                  {apiEndpoint && apiKey && userId ? "Ready" : "Incomplete"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
