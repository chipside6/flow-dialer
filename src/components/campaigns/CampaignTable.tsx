
import React from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { CampaignItem } from "./CampaignItem";
import { useCampaignContext } from "@/contexts/campaign/CampaignContext";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export const CampaignTable: React.FC = () => {
  const { campaigns } = useCampaignContext();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Execution</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <p className="text-muted-foreground">No campaigns found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first campaign to start making calls
                </p>
                <Link to="/campaign">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          campaigns.map((campaign) => (
            <CampaignItem key={campaign.id} campaign={campaign} />
          ))
        )}
      </TableBody>
    </Table>
  );
};
