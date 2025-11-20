import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Mail, Save } from "lucide-react";

const EmailSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    sender_email: "",
    smtp_password: "",
    smtp_host: "smtp.gmail.com",
    smtp_port: 587,
    is_enabled: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("email_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("email_settings").upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Email settings saved successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Email Settings</h1>
        <p className="text-muted-foreground">
          Configure email notifications for farm updates and alerts
        </p>
      </div>

      <Card className="max-w-2xl border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>Set up your email sender credentials</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <p className="font-medium text-foreground">Enable Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive automated alerts and updates
              </p>
            </div>
            <Switch
              checked={settings.is_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, is_enabled: checked })
              }
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sender_email">Sender Email Address</Label>
              <Input
                id="sender_email"
                type="email"
                placeholder="your-email@gmail.com"
                value={settings.sender_email}
                onChange={(e) =>
                  setSettings({ ...settings, sender_email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_password">SMTP App Password</Label>
              <Input
                id="smtp_password"
                type="password"
                placeholder="Enter your app password"
                value={settings.smtp_password}
                onChange={(e) =>
                  setSettings({ ...settings, smtp_password: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                For Gmail, generate an app password in your Google Account settings
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp_host">SMTP Host</Label>
                <Input
                  id="smtp_host"
                  value={settings.smtp_host}
                  onChange={(e) =>
                    setSettings({ ...settings, smtp_host: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_port">SMTP Port</Label>
                <Input
                  id="smtp_port"
                  type="number"
                  value={settings.smtp_port}
                  onChange={(e) =>
                    setSettings({ ...settings, smtp_port: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={loading} className="w-full gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="font-medium text-sm text-foreground mb-2">Setup Instructions</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Use a Gmail account for sending emails</li>
              <li>Enable 2-Step Verification in your Google Account</li>
              <li>Generate an App Password in Security settings</li>
              <li>Use the app password (not your regular password) here</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSettings;
