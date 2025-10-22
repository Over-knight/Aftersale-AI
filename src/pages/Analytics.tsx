import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Analytics() {
  const messageData = [
    { month: "Jan", sent: 1200 },
    { month: "Feb", sent: 1800 },
    { month: "Mar", sent: 1600 },
    { month: "Apr", sent: 2200 },
    { month: "May", sent: 2800 },
    { month: "Jun", sent: 3200 },
  ];

  const openRateData = [
    { month: "Jan", rate: 38 },
    { month: "Feb", rate: 42 },
    { month: "Mar", rate: 40 },
    { month: "Apr", rate: 45 },
    { month: "May", rate: 48 },
    { month: "Jun", rate: 52 },
  ];

  const recentCampaigns = [
    { name: "Summer Sale Follow-up", sent: 1250, opened: 525, clicked: 210 },
    { name: "Welcome Series", sent: 890, opened: 356, clicked: 142 },
    { name: "Birthday Special", sent: 650, opened: 325, clicked: 130 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track your campaign performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Messages Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={messageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="sent" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Open Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={openRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Retention Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-secondary rounded-xl">
              <p className="text-sm text-muted-foreground mb-2">Retention Uplift</p>
              <p className="text-4xl font-bold text-green-500">+12%</p>
              <p className="text-sm text-muted-foreground mt-2">vs. last quarter</p>
            </div>
            <div className="p-6 bg-secondary rounded-xl">
              <p className="text-sm text-muted-foreground mb-2">Avg. Response Time</p>
              <p className="text-4xl font-bold text-blue-500">2.4h</p>
              <p className="text-sm text-muted-foreground mt-2">customer replies</p>
            </div>
            <div className="p-6 bg-secondary rounded-xl">
              <p className="text-sm text-muted-foreground mb-2">Customer Lifetime Value</p>
              <p className="text-4xl font-bold text-purple-500">$847</p>
              <p className="text-sm text-muted-foreground mt-2">average per customer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Campaign</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Sent</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Opened</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Clicked</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Open Rate</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map((campaign, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="px-4 py-4 font-medium">{campaign.name}</td>
                    <td className="px-4 py-4">{campaign.sent}</td>
                    <td className="px-4 py-4">{campaign.opened}</td>
                    <td className="px-4 py-4">{campaign.clicked}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-medium">
                        {Math.round((campaign.opened / campaign.sent) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
