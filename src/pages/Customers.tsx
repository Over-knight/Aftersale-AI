import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { User, Mail, Phone, ShoppingBag, MessageSquare } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  purchases: number;
  lastContact: string;
  timeline: Array<{ type: string; date: string; detail: string }>;
}

export default function Customers() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const customers: Customer[] = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 234-567-8901",
      purchases: 5,
      lastContact: "2024-01-10",
      timeline: [
        { type: "purchase", date: "2024-01-10", detail: "Purchased Premium Plan - $99" },
        { type: "message", date: "2024-01-05", detail: "Sent welcome email" },
        { type: "purchase", date: "2023-12-20", detail: "Purchased Starter Plan - $29" },
      ],
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 234-567-8902",
      purchases: 3,
      lastContact: "2024-01-08",
      timeline: [
        { type: "message", date: "2024-01-08", detail: "Sent feedback request" },
        { type: "purchase", date: "2024-01-01", detail: "Purchased Enterprise Plan - $299" },
        { type: "purchase", date: "2023-11-15", detail: "Purchased Business Plan - $149" },
      ],
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1 234-567-8903",
      purchases: 8,
      lastContact: "2024-01-12",
      timeline: [
        { type: "purchase", date: "2024-01-12", detail: "Purchased Add-on Package - $49" },
        { type: "message", date: "2024-01-10", detail: "Sent promotional offer" },
        { type: "purchase", date: "2024-01-05", detail: "Purchased Premium Plan - $99" },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Customers</h1>
        <p className="text-muted-foreground">Manage your customer database</p>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Purchases</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Last Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border hover:bg-secondary/50 transition-smooth">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{customer.email}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{customer.phone}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                        {customer.purchases}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{customer.lastContact}</td>
                    <td className="px-6 py-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        View Profile
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedCustomer.name}</h3>
                  <p className="text-sm text-muted-foreground">Customer since Dec 2023</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{selectedCustomer.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{selectedCustomer.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Activity Timeline</h4>
                <div className="space-y-4">
                  {selectedCustomer.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            event.type === "purchase" ? "bg-green-500/20" : "bg-blue-500/20"
                          }`}
                        >
                          {event.type === "purchase" ? (
                            <ShoppingBag className="h-5 w-5 text-green-500" />
                          ) : (
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        {index < selectedCustomer.timeline.length - 1 && (
                          <div className="w-px h-8 bg-border" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.detail}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
