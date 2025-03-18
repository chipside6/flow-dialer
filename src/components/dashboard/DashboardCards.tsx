
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AudioWaveform, ContactIcon, PhoneForwarded, Server, BarChart3 } from "lucide-react";

export const DashboardCards = () => {
  return (
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
  );
};
