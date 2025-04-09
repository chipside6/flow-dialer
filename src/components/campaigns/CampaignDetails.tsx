
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Phone, Calendar, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface CampaignDetailsProps {
  campaignId?: string;
}

export const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaignId }) => {
  const navigate = useNavigate();
  
  // In a real implementation, you'd fetch campaign details from an API or database
  // For now, we'll render a simple placeholder UI
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaign Details</h1>
          <p className="text-muted-foreground">ID: {campaignId}</p>
        </div>
        
        <Button 
          onClick={() => navigate(`/campaigns/${campaignId}/dialer`)}
          className="gap-2"
        >
          <Phone className="h-4 w-4" />
          Start Dialer
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant="outline">Active</Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm">April 15, 2023</p>
              </div>
              <div>
                <p className="text-sm font-medium">Contact List</p>
                <p className="text-sm">Main Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Total Calls</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-sm font-medium">Answered Calls</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div>
                <p className="text-sm font-medium">Transfer Rate</p>
                <p className="text-2xl font-bold">0%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <Play className="mr-2 h-4 w-4" />
                Preview Audio
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Calls
              </Button>
              <Button className="w-full" variant="outline">
                <Info className="mr-2 h-4 w-4" />
                View Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
