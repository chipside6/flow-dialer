
import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, BarChart, PhoneCall, PhoneForwarded, PhoneOff, Phone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Campaign {
  id: string;
  title: string;
  status: "pending" | "running" | "completed" | "paused";
  progress: number;
  totalCalls: number;
  answeredCalls: number;
  transferredCalls: number;
  failedCalls: number;
}

const CampaignDashboard = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // Mock data for demo purposes
  useEffect(() => {
    // This would come from your API in a real app
    const demoData: Campaign[] = [
      {
        id: "camp-123456",
        title: "Summer Sales Outreach",
        status: "pending",
        progress: 0,
        totalCalls: 150,
        answeredCalls: 0,
        transferredCalls: 0,
        failedCalls: 0
      },
      {
        id: "camp-234567",
        title: "Customer Follow-up",
        status: "pending",
        progress: 0,
        totalCalls: 75,
        answeredCalls: 0,
        transferredCalls: 0,
        failedCalls: 0
      }
    ];
    
    setCampaigns(demoData);
  }, []);

  const startCampaign = (campaignId: string) => {
    setCampaigns(prev => 
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          // Select this campaign to view its details
          setSelectedCampaign({...campaign, status: "running"});
          
          // Start the simulation for the campaign
          simulateCampaignProgress(campaignId);
          
          return {
            ...campaign, 
            status: "running"
          };
        }
        return campaign;
      })
    );
    
    toast({
      title: "Campaign Started",
      description: "The autodialer is now processing your call list.",
    });
  };

  const pauseCampaign = (campaignId: string) => {
    setCampaigns(prev => 
      prev.map(campaign => {
        if (campaign.id === campaignId) {
          setSelectedCampaign({...campaign, status: "paused"});
          return {
            ...campaign, 
            status: "paused"
          };
        }
        return campaign;
      })
    );
    
    toast({
      title: "Campaign Paused",
      description: "The autodialer has been paused.",
    });
  };

  // Simulate campaign progress for demo purposes
  const simulateCampaignProgress = (campaignId: string) => {
    // Find the campaign
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign || campaign.status !== "running") return;

    // Create a random interval (between 2-4 seconds) to simulate calls being made
    const interval = setInterval(() => {
      setCampaigns(prev => {
        const updatedCampaigns = prev.map(c => {
          if (c.id === campaignId && c.status === "running") {
            // Simulate progress
            const newProgress = Math.min(c.progress + Math.random() * 5, 100);
            const newAnswered = Math.floor((newProgress / 100) * c.totalCalls * 0.7); // 70% answer rate
            const newTransferred = Math.floor(newAnswered * 0.4); // 40% transfer rate
            const newFailed = Math.floor((newProgress / 100) * c.totalCalls * 0.3); // 30% fail rate
            
            // Explicitly type the status as one of the allowed values
            const newStatus: Campaign["status"] = newProgress >= 100 ? "completed" : "running";
            
            const updatedCampaign: Campaign = {
              ...c,
              progress: Math.round(newProgress),
              answeredCalls: newAnswered,
              transferredCalls: newTransferred,
              failedCalls: newFailed,
              status: newStatus
            };
            
            // Update selected campaign if it's the same one
            if (selectedCampaign?.id === campaignId) {
              setSelectedCampaign(updatedCampaign);
            }
            
            return updatedCampaign;
          }
          return c;
        });
        
        // If campaign is complete, clear the interval
        const targetCampaign = updatedCampaigns.find(c => c.id === campaignId);
        if (targetCampaign?.status === "completed") {
          clearInterval(interval);
          toast({
            title: "Campaign Completed",
            description: "All calls in the campaign have been processed.",
          });
        }
        
        return updatedCampaigns;
      });
    }, 2000 + Math.random() * 2000);
    
    // Store the interval ID somewhere so it can be cleared if needed
    return () => clearInterval(interval);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Campaign Dashboard</h2>
        <Button variant="default" className="bg-green-600 hover:bg-green-700">
          Add New Campaign
        </Button>
      </div>

      <Card>
        <CardHeader className="bg-muted/40">
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Execution</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No active campaigns found. Create a campaign to get started.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow 
                    key={campaign.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <TableCell className="font-medium">{campaign.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        campaign.status === "running" ? "bg-green-100 text-green-800" : 
                        campaign.status === "paused" ? "bg-yellow-100 text-yellow-800" : 
                        campaign.status === "completed" ? "bg-blue-100 text-blue-800" : 
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="w-[30%]">
                      <div className="flex items-center gap-2">
                        <Progress value={campaign.progress} className="h-2" />
                        <span className="text-xs whitespace-nowrap">{campaign.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {campaign.status === "running" ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            pauseCampaign(campaign.id);
                          }}
                        >
                          <Pause className="h-4 w-4 mr-1" /> Pause
                        </Button>
                      ) : campaign.status === "completed" ? (
                        <Button variant="outline" size="sm" disabled>
                          <BarChart className="h-4 w-4 mr-1" /> View Report
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            startCampaign(campaign.id);
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" /> Start
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedCampaign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-muted/40">
              <CardTitle className="text-lg">Campaign Details: {selectedCampaign.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedCampaign.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={selectedCampaign.progress} className="h-2 flex-1" />
                    <span>{selectedCampaign.progress}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Campaign ID</p>
                  <p className="font-mono text-sm">{selectedCampaign.id}</p>
                </div>
                <div className="pt-2">
                  {selectedCampaign.status === "running" ? (
                    <Button variant="outline" onClick={() => pauseCampaign(selectedCampaign.id)}>
                      <Pause className="h-4 w-4 mr-2" /> Pause Campaign
                    </Button>
                  ) : selectedCampaign.status === "paused" || selectedCampaign.status === "pending" ? (
                    <Button variant="default" onClick={() => startCampaign(selectedCampaign.id)}>
                      <Play className="h-4 w-4 mr-2" /> Start Campaign
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/40">
              <CardTitle className="text-lg">Live Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border border-border/40">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <PhoneCall className="h-6 w-6 text-primary mb-2" />
                    <p className="text-muted-foreground text-sm">Total Calls</p>
                    <p className="text-2xl font-bold">{selectedCampaign.totalCalls}</p>
                  </CardContent>
                </Card>
                
                <Card className="border border-border/40">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <Phone className="h-6 w-6 text-green-500 mb-2" />
                    <p className="text-muted-foreground text-sm">Answered</p>
                    <p className="text-2xl font-bold">{selectedCampaign.answeredCalls}</p>
                  </CardContent>
                </Card>
                
                <Card className="border border-border/40">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <PhoneForwarded className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-muted-foreground text-sm">Transferred</p>
                    <p className="text-2xl font-bold">{selectedCampaign.transferredCalls}</p>
                  </CardContent>
                </Card>
                
                <Card className="border border-border/40">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                    <PhoneOff className="h-6 w-6 text-destructive mb-2" />
                    <p className="text-muted-foreground text-sm">Failed</p>
                    <p className="text-2xl font-bold">{selectedCampaign.failedCalls}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CampaignDashboard;
