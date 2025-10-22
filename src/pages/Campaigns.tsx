import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Megaphone, Calendar, Send, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Campaigns() {
  const navigate = useNavigate();

  const campaigns = [
    {
      id: 1,
      name: "Summer Sale Follow-up",
      status: "active",
      sent: 1250,
      scheduled: "2024-01-15",
      openRate: "42%",
    },
    {
      id: 2,
      name: "Welcome Series",
      status: "completed",
      sent: 890,
      scheduled: "2024-01-10",
      openRate: "38%",
    },
    {
      id: 3,
      name: "Re-engagement Campaign",
      status: "draft",
      sent: 0,
      scheduled: "2024-01-20",
      openRate: "-",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-500";
      case "completed":
        return "bg-blue-500/20 text-blue-500";
      case "draft":
        return "bg-yellow-500/20 text-yellow-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Campaigns</h1>
          <p className="text-muted-foreground">Manage your customer engagement campaigns</p>
        </div>
        <Button
          onClick={() => navigate("/campaigns/create")}
          className="gradient-primary shadow-glow hover:opacity-90 transition-smooth"
        >
          <Megaphone className="mr-2 h-5 w-5" />
          Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="shadow-card hover:shadow-glow transition-smooth cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold">{campaign.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  {campaign.scheduled}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Send className="mr-2 h-4 w-4" />
                  {campaign.sent} messages sent
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  Open rate: {campaign.openRate}
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
