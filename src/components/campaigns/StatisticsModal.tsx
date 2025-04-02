
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Campaign } from "@/hooks/useCampaigns";
import { PhoneCall, PhoneForwarded, PhoneOff, VoicemailIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = React.useState("overview");

  if (!campaign) return null;

  // For demonstration purposes - in a real app, these would come from your database
  const getPhoneNumbers = (type: 'total' | 'transferred' | 'failed' | 'voicemail') => {
    // This is just for demo purposes - in reality, you would fetch real phone numbers
    const count = type === 'total' 
      ? campaign.totalCalls
      : type === 'transferred' 
        ? campaign.transferredCalls
        : type === 'failed'
          ? campaign.failedCalls
          : (campaign.totalCalls - campaign.transferredCalls - campaign.failedCalls);
          
    return Array(Math.min(count, 5)).fill(0).map((_, index) => {
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
          <DialogTitle>Campaign Statistics: {campaign.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="details" className="flex-1">Phone Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
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
                    <div className="mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-1 p-1 h-auto flex justify-center"
                        onClick={() => setActiveTab("details")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span>View Numbers</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6 p-2">
                {callStats.map((stat) => (
                  <div key={stat.id}>
                    <h3 className="flex items-center gap-2 mb-2">
                      <span className={stat.color}>{stat.icon}</span>
                      <span className="font-medium">{stat.title}</span>
                      <span className="text-muted-foreground">({stat.count})</span>
                    </h3>
                    <div className="space-y-2 ml-7">
                      {stat.phoneNumbers && stat.phoneNumbers.length > 0 ? (
                        stat.phoneNumbers.map((phone, idx) => (
                          <Card key={idx} className="p-3">
                            <div className="text-sm">{phone}</div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-muted-foreground">Phone numbers will appear here</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
