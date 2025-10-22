import { Users, Megaphone, Send, TrendingUp } from "lucide-react";
import { Button } from "../components/ui/button";
import { StatCard } from "../components/dashboard/StatCard";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Customers",
      value: "2,847",
      icon: Users,
      trend: "+12% from last month",
      trendUp: true,
    },
    {
      title: "Active Campaigns",
      value: "24",
      icon: Megaphone,
      trend: "8 scheduled",
      trendUp: true,
    },
    {
      title: "Messages Sent",
      value: "15,432",
      icon: Send,
      trend: "+8% from last month",
      trendUp: true,
    },
    {
      title: "Retention Rate",
      value: "68%",
      icon: TrendingUp,
      trend: "+5% from last month",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your customer retention performance
          </p>
        </div>
        <Button
          onClick={() => navigate("/campaigns/create")}
          className="gradient-primary shadow-glow hover:opacity-90 transition-smooth"
        >
          <Megaphone className="mr-2 h-5 w-5" />
          Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl bg-card border border-border shadow-card">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: "Campaign 'Summer Sale Follow-up' sent", time: "2 hours ago" },
              { action: "New customer added: John Doe", time: "4 hours ago" },
              { action: "Campaign 'Welcome Series' completed", time: "1 day ago" },
              { action: "Analytics report generated", time: "2 days ago" },
            ].map((activity, i) => (
              <div key={i} className="flex justify-between items-center pb-4 border-b border-border last:border-0">
                <span className="text-sm">{activity.action}</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-xl bg-card border border-border shadow-card">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            {[
              { label: "Open Rate", value: "42%", color: "bg-green-500" },
              { label: "Click Rate", value: "18%", color: "bg-blue-500" },
              { label: "Response Rate", value: "24%", color: "bg-purple-500" },
              { label: "Conversion Rate", value: "12%", color: "bg-yellow-500" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{stat.label}</span>
                  <span className="font-semibold">{stat.value}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stat.color}`}
                    style={{ width: stat.value }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
