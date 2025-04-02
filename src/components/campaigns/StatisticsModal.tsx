
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Campaign } from "@/hooks/useCampaigns";
import { PhoneCall, PhoneForwarded, PhoneOff, VoicemailIcon, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatisticsModalProps {
  campaign: Campaign | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CallStatistic {
  id: string;
  title: string;
  count: number;
  icon: React.ReactNode;
  phoneNumbers?: string[];
  color: string;
}

export const StatisticsModal: React.FC<StatisticsModalProps> = ({
  campaign,
  open,
  onOpenChange,
}) => {
  const [showPhoneNumbers, setShowPhoneNumbers] = React.useState(false);

  if (!campaign) return null;

  // For demonstration purposes - in a real app, these would come from your database
  const getPhoneNumbers = (type: 'total' | 'transferred' | 'failed' | 'voicemail') => {
    // This is just for demo purposes - in reality, you would fetch real phone numbers
    return Array(3).fill(0).map((_, index) => {
      return `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
    });
  };

  const callStats: CallStatistic[] = [
    {
      id: 'total',
      title: 'Total Calls',
      count: campaign.totalCalls,
      icon: <PhoneCall className="h-5 w-5" />,
      phoneNumbers: getPhoneNumbers('total'),
      color: 'text-blue-500'
    },
    {
      id: 'transferred',
      title: 'Transferred',
      count: campaign.transferredCalls,
      icon: <PhoneForwarded className="h-5 w-5" />,
      phoneNumbers: getPhoneNumbers('transferred'),
      color: 'text-green-500'
    },
    {
      id: 'failed',
      title: 'Failed',
      count: campaign.failedCalls,
      icon: <PhoneOff className="h-5 w-5" />,
      phoneNumbers: getPhoneNumbers('failed'),
      color: 'text-red-500'
    },
    {
      id: 'voicemail',
      title: 'Voicemail',
      count: (campaign.totalCalls - campaign.transferredCalls - campaign.failedCalls),
      icon: <VoicemailIcon className="h-5 w-5" />,
      phoneNumbers: getPhoneNumbers('voicemail'),
      color: 'text-purple-500'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Campaign Statistics: {campaign.title}</span>
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
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-2">
          {callStats.map((stat) => (
            <Card key={stat.id} className="shadow-sm">
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
