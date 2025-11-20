import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sunrise, Sun, Sunset, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Summary = {
  id: string;
  period: string;
  title: string;
  content: string;
  recommendations: string[];
  created_at: string;
};

const DailySummary = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_summaries")
        .select("*")
        .eq("summary_date", new Date().toISOString().split("T")[0])
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSummaries(data || []);
    } catch (error) {
      console.error("Error loading summaries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case "morning":
        return <Sunrise className="h-6 w-6 text-accent" />;
      case "midday":
        return <Sun className="h-6 w-6 text-primary" />;
      case "evening":
        return <Sunset className="h-6 w-6 text-chart-4" />;
      default:
        return null;
    }
  };

  const getPeriodBadge = (period: string) => {
    const variants: any = {
      morning: "default",
      midday: "secondary",
      evening: "outline",
    };
    return variants[period] || "default";
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading summaries...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Daily Summary</h1>
        <p className="text-muted-foreground">
          Your personalized farming guidance throughout the day
        </p>
      </div>

      {summaries.length === 0 ? (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sun className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">
              No summaries available for today yet.
              <br />
              Check back later for personalized recommendations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {summaries.map((summary) => (
            <Card key={summary.id} className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getPeriodIcon(summary.period)}
                    <div>
                      <CardTitle className="text-xl">{summary.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(summary.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getPeriodBadge(summary.period)}>
                    {summary.period.charAt(0).toUpperCase() + summary.period.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground leading-relaxed">{summary.content}</p>

                {summary.recommendations && summary.recommendations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Recommendations:
                    </h4>
                    <ul className="space-y-2">
                      {summary.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-dashed border-2 border-muted bg-muted/20">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Summaries are automatically generated based on your farm's conditions and environmental
            data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySummary;
