import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ArrowLeft, ArrowRight, Sparkles, Calendar, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const steps = ["Select Event", "Preview Messages", "Schedule & Send"];

export default function CampaignCreate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedTone, setSelectedTone] = useState<"formal" | "casual">("casual");
  const [selectedMessage, setSelectedMessage] = useState(0);

  const events = [
    { id: "purchase", label: "After Purchase", description: "Thank customers after a sale" },
    { id: "birthday", label: "Birthday", description: "Celebrate customer birthdays" },
    { id: "inactive", label: "Inactive User", description: "Re-engage inactive customers" },
    { id: "anniversary", label: "Anniversary", description: "Celebrate milestones" },
  ];

  const messages = {
    formal: [
      {
        title: "Professional Thank You",
        preview: "Dear [Name], Thank you for your recent purchase. We appreciate your business...",
      },
      {
        title: "Formal Follow-up",
        preview: "Hello [Name], We hope you're enjoying your purchase. If you need assistance...",
      },
      {
        title: "Courteous Check-in",
        preview: "Greetings [Name], We wanted to reach out and ensure your satisfaction...",
      },
    ],
    casual: [
      {
        title: "Friendly Thanks",
        preview: "Hey [Name]! 👋 Thanks so much for your order! We hope you love it...",
      },
      {
        title: "Casual Check-in",
        preview: "Hi [Name]! Just checking in to see how everything's going with your purchase...",
      },
      {
        title: "Warm Follow-up",
        preview: "Hey there [Name]! We're so glad you're part of our community...",
      },
    ],
  };

  const handleNext = () => {
    if (currentStep === 0 && !selectedEvent) {
      toast.error("Please select an event type");
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSend = () => {
    toast.success("Campaign scheduled successfully!");
    setTimeout(() => navigate("/campaigns"), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/campaigns")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold mb-2">Create Campaign</h1>
          <p className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                index <= currentStep ? "bg-primary text-primary-foreground" : "bg-secondary"
              }`}
            >
              {index + 1}
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${index <= currentStep ? "" : "text-muted-foreground"}`}>
                {step}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-1 flex-1 mx-4 ${index < currentStep ? "bg-primary" : "bg-secondary"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <Card
              key={event.id}
              className={`cursor-pointer shadow-card transition-smooth ${
                selectedEvent === event.id ? "ring-2 ring-primary shadow-glow" : "hover:shadow-glow"
              }`}
              onClick={() => setSelectedEvent(event.id)}
            >
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">{event.label}</h3>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-medium">AI-Generated Messages</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedTone === "formal" ? "default" : "outline"}
                onClick={() => setSelectedTone("formal")}
              >
                Formal
              </Button>
              <Button
                variant={selectedTone === "casual" ? "default" : "outline"}
                onClick={() => setSelectedTone("casual")}
              >
                Casual
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {messages[selectedTone].map((message, index) => (
              <Card
                key={index}
                className={`cursor-pointer shadow-card transition-smooth ${
                  selectedMessage === index ? "ring-2 ring-primary shadow-glow" : "hover:shadow-glow"
                }`}
                onClick={() => setSelectedMessage(index)}
              >
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">{message.title}</h3>
                  <p className="text-sm text-muted-foreground">{message.preview}</p>
                  <Button variant="ghost" size="sm" className="mt-4">
                    Edit Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <Card className="shadow-card">
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Campaign Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-input rounded-lg border border-border focus:ring-2 focus:ring-primary outline-none"
                placeholder="Enter campaign name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Schedule Date & Time</label>
              <div className="flex gap-4">
                <input
                  type="date"
                  className="flex-1 px-4 py-2 bg-input rounded-lg border border-border focus:ring-2 focus:ring-primary outline-none"
                />
                <input
                  type="time"
                  className="flex-1 px-4 py-2 bg-input rounded-lg border border-border focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-secondary rounded-lg">
              <h3 className="font-semibold mb-2">Campaign Summary</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Event: {events.find((e) => e.id === selectedEvent)?.label}</p>
                <p>Message Style: {selectedTone}</p>
                <p>Selected Template: {messages[selectedTone][selectedMessage].title}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep === steps.length - 1 ? (
          <Button onClick={handleSend} className="gradient-primary shadow-glow hover:opacity-90 transition-smooth">
            <Send className="mr-2 h-4 w-4" />
            Schedule Campaign
          </Button>
        ) : (
          <Button onClick={handleNext} className="gradient-primary shadow-glow hover:opacity-90 transition-smooth">
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
