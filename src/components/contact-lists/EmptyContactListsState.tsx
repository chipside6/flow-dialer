
import React from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmptyContactListsState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-8 my-12 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30">
      <FileSpreadsheet className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-3">No Contact Lists Yet</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        Create your first contact list to start managing contacts and use them in your campaigns.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="default" 
          className="flex items-center gap-2"
          onClick={() => {
            document.getElementById('create-list-form')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Create New List</span>
        </Button>
      </div>
    </div>
  );
};

export default EmptyContactListsState;
