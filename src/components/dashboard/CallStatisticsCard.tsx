
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, PhoneCall, PhoneForwarded, PhoneOff, VoicemailIcon } from "lucide-react";
import { useCampaigns } from "@/hooks/useCampaigns";

interface CallStatistic {
  id: string;
  title: string;
  count: number;
  icon: React.ReactNode;
  phoneNumbers?: string[];
  color: string;
}

export const CallStatisticsCard = () => {
  const { campaigns } = useCampaigns();
  const [showPhoneNumbers, setShowPhoneNumbers] = useState(false);

  // Calculate totals from all campaigns
  const totalStats = campaigns.reduce((acc, campaign) => {
    return {
      total: acc.total + (campaign.totalCalls || 0),
      transferred: acc.transferred + (campaign.transferredCalls || 0),
      failed: acc.failed + (campaign.failedCalls || 0),
      voicemail: acc.voicemail + ((campaign.totalCalls || 0) - 
                                 (campaign.transferredCalls || 0) - 
                                 (campaign.failedCalls || 0))
    };
  }, { total: 0, transferred: 0, failed: 0, voicemail: 0 });
  
  // Sample phone numbers (in a real app, these would come from your database)
  // For demonstration purposes, we're creating dummy phone numbers based on campaign data
  const getPhoneNumbers = (type: 'total' | 'transferred' | 'failed' | 'voicemail') => {
    if (!campaigns.length) return ['No phone numbers available'];
    
    // This is just for demo purposes - in reality, you would fetch real phone numbers
    const phoneNumbers = campaigns.map((campaign, index) => {
      return `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
    }).slice(0, 3); // Limit to 3 for display purposes
    
    return phoneNumbers.length ? phoneNumbers : ['No phone numbers available'];
  };

  const callStats: CallStatistic[] = [
    {
      id: 'total',
      title: 'Total Calls',
      count: totalStats.total,
      icon: <PhoneCall className="h-5 w-5" />,
      phoneNumbers: getPhoneNumbers('total'),
      color: 'text-blue-500'
    },
    {
      id: 'transferred',
      title: 'Transferred',
      count: totalStats.transferred,
      icon: <PhoneForwarded className="h-5 w-5" />,
      phoneNumbers: getPhoneNumbers('transferred'),
      color: 'text-green-500'
    },
    {
      id: 'failed',
      title: 'Failed',
      count: totalStats.failed,
      icon: <PhoneOff className="h-5 w-5" />,
      phoneNumbers: getPhoneNumbers('failed'),
      color: 'text-red-500'
    },
    {
      id: 'voicemail',
      title: 'Voicemail',
      count: totalStats.voicemail,
      icon: <VoicemailIcon className="h-5 w-5" />,
      phoneNumbers: getPhoneNumbers('voicemail'),
      color: 'text-purple-500'
    }
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-xl">Call Statistics</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowPhoneNumbers(!showPhoneNumbers)}
          className="h-8 px-2 text-muted-foreground"
        >
          {showPhoneNumbers ? (
            <EyeOff className="h-4 w-4 mr-1" />
          ) : (
            <Eye className="h-4 w-4 mr-1" />
          )}
          {showPhoneNumbers ? 'Hide Numbers' : 'View Numbers'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {callStats.map((stat) => (
            <div key={stat.id} className="flex flex-col p-3 border rounded-lg bg-card">
              <div className="flex items-center mb-2">
                <div className={`rounded-full p-1.5 mr-2 ${stat.color.replace('text-', 'bg-').replace('500', '100')}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <div className="font-medium">{stat.title}</div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.count}</div>
              {showPhoneNumbers && (
                <div className="mt-2 pt-2 border-t text-xs space-y-1 max-h-24 overflow-y-auto">
                  {stat.phoneNumbers?.map((phone, idx) => (
                    <div key={idx} className="text-muted-foreground">{phone}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
