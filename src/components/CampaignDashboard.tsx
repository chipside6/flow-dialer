
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, RefreshCw, PlusCircle } from 'lucide-react';
import { Campaign } from '@/types/campaign';

interface CampaignDashboardProps {
  initialCampaigns: Campaign[];
  onRefresh?: () => void;
}

const CampaignDashboard: React.FC<CampaignDashboardProps> = ({ 
  initialCampaigns, 
  onRefresh 
}) => {
  const navigate = useNavigate();
  const [campaigns] = useState<Campaign[]>(initialCampaigns);
  
  const handleViewCampaign = (id: string) => {
    navigate(`/campaigns/${id}`);
  };
  
  const handleStartCampaign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Start campaign:', id);
    // Implement campaign start logic if needed
  };
  
  const handlePauseCampaign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Pause campaign:', id);
    // Implement campaign pause logic if needed
  };
  
  const handleCreateCampaign = () => {
    navigate('/campaign');
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-amber-100 text-amber-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Campaigns</CardTitle>
        <div className="flex gap-2">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh</span>
            </Button>
          )}
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleCreateCampaign}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-3 w-3" />
            <span>Create</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {campaigns.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No campaigns found</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={handleCreateCampaign}
            >
              Create your first campaign
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                className="border rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleViewCampaign(campaign.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{campaign.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {campaign.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                      {campaign.totalCalls > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {campaign.answeredCalls || 0}/{campaign.totalCalls} calls
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === 'running' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => handlePauseCampaign(campaign.id, e)}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    ) : campaign.status !== 'completed' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => handleStartCampaign(campaign.id, e)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignDashboard;
