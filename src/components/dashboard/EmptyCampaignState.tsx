
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, PlusCircle } from "lucide-react";

export const EmptyCampaignState = () => {
  return (
    <Card className="border-dashed border-2 border-border">
      <CardContent className="py-12">
        <div className="text-center space-y-6">
          <div className="mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Phone className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Start making calls</h3>
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
  );
};
