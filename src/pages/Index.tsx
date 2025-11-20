import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, TrendingUp, Users, Mail, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: TrendingUp,
      title: "Daily Summaries",
      description: "Receive personalized farming guidance throughout the day",
    },
    {
      icon: BarChart3,
      title: "Data Analytics",
      description: "Visualize temperature, pH, EC, CO₂, and NDVI measurements",
    },
    {
      icon: Mail,
      title: "Email Alerts",
      description: "Get automated notifications about your farm's condition",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with farmers and get instant admin assistance",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Sprout className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Farm Dashboard
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Your intelligent agricultural platform for data-driven farming decisions.
            Monitor, analyze, and optimize your farm with real-time insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg px-8"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center space-y-3">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <Card className="border-border bg-card/50 backdrop-blur">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center text-foreground mb-6">
                Why Choose Farm Dashboard?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">🌱 Smart Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered insights tailored to your farm's unique conditions
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">📊 Real-Time Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor all critical metrics in one unified dashboard
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">🤝 Community First</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect with experienced farmers and agronomists
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">🔐 Secure & Private</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is encrypted and protected with industry standards
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
