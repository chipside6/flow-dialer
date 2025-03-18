
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export const EmptyCampaignState = () => {
  return (
    <Card className="border border-border">
      <CardContent className="p-6 md:p-8">
        <div className="space-y-4 max-w-lg">
          <h3 className="text-2xl font-bold">Start making calls</h3>
          <p className="text-muted-foreground">
            Create your first campaign to start making automated calls. Our platform helps you reach more people efficiently with personalized messages.
          </p>
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:space-x-3 mt-2">
            <Link to="/campaign">
              <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create First Campaign
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" className="w-full sm:w-auto">
                Learn about campaigns
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
