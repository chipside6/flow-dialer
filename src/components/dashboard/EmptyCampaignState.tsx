
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export const EmptyCampaignState = () => {
  const navigate = useNavigate();
  
  const handleCreateCampaign = () => {
    // Navigate to campaign page with state to show wizard
    navigate('/campaign', { state: { showCreateWizard: true } });
  };

  return (
    <Card className="border-dashed border-2 border-border overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-10 flex items-center justify-center md:w-1/3">
            <img 
              src="/lovable-uploads/9a0a1a54-92ba-41e4-9556-e2bb8514e01a.png" 
              alt="Campaign illustration" 
              className="max-w-full max-h-52 object-contain"
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const div = document.createElement('div');
                  div.className = "w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center";
                  const phoneIcon = document.createElement('div');
                  phoneIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
                  div.appendChild(phoneIcon);
                  parent.appendChild(div);
                }
              }}
            />
          </div>
          <div className="py-10 px-8 md:w-2/3">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold break-words">Start making calls</h3>
              <p className="text-muted-foreground max-w-md break-normal">
                Create your first campaign to start making automated calls. Our platform helps you reach more people efficiently with personalized messages.
              </p>
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3 mt-6">
                <Button 
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto whitespace-nowrap"
                  onClick={handleCreateCampaign}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create First Campaign
                </Button>
                <Button variant="outline" className="w-full sm:w-auto whitespace-nowrap" onClick={() => navigate('/features')}>
                  Learn about campaigns
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
