
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { DashboardNav } from "@/components/DashboardNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { AudioWaveform, ContactIcon, PhoneForwarded, Server, BarChart3, PlusCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        setCampaigns(data || []);
      } catch (error: any) {
        console.error('Error fetching campaigns:', error.message);
        toast({
          title: "Error loading campaigns",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [user, toast]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <DashboardNav />
            </div>
            <div className="md:w-3/4">
              <h1 className="text-3xl font-bold mb-6">Campaign Analytics</h1>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : campaigns.length === 0 ? (
                <Card className="border-dashed border-2 border-border">
                  <CardContent className="py-12">
                    <div className="text-center space-y-6">
                      <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="space-y-2">
                        <h3 className="text-xl font-medium">No campaigns yet</h3>
                        <p className="text-muted-foreground">
                          Create your first campaign to start making automated calls.
                        </p>
                      </div>
                      <Link to="/campaign">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create First Campaign
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AudioWaveform className="mr-2 h-5 w-5" />
                        Greeting Files
                      </CardTitle>
                      <CardDescription>Manage your audio greeting files</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Upload and manage audio files for your campaign greetings.</p>
                    </CardContent>
                    <CardFooter>
                      <Link to="/greetings" className="w-full">
                        <Button className="w-full">Manage Greetings</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <ContactIcon className="mr-2 h-5 w-5" />
                        Contact Lists
                      </CardTitle>
                      <CardDescription>Manage your contact lists</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Create and organize contact lists for your campaigns.</p>
                    </CardContent>
                    <CardFooter>
                      <Link to="/contacts" className="w-full">
                        <Button className="w-full">Manage Contacts</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PhoneForwarded className="mr-2 h-5 w-5" />
                        Transfer Numbers
                      </CardTitle>
                      <CardDescription>Configure transfer destinations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Set up where calls will be transferred when recipients request it.</p>
                    </CardContent>
                    <CardFooter>
                      <Link to="/transfers" className="w-full">
                        <Button className="w-full">Manage Transfers</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Server className="mr-2 h-5 w-5" />
                        SIP Providers
                      </CardTitle>
                      <CardDescription>Manage your SIP trunk configurations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Configure and manage your SIP provider connections.</p>
                    </CardContent>
                    <CardFooter>
                      <Link to="/sip-providers" className="w-full">
                        <Button className="w-full">Manage Providers</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Campaigns
                      </CardTitle>
                      <CardDescription>Create and manage your calling campaigns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>Create, configure, and monitor the progress of your calling campaigns.</p>
                    </CardContent>
                    <CardFooter>
                      <Link to="/campaign" className="w-full">
                        <Button className="w-full">Manage Campaigns</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
