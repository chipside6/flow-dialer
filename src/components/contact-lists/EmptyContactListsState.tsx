
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EmptyContactListsState = () => {
  return (
    <Card className="mt-6 w-full overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl text-center">No Contact Lists Yet</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-4">
          Create your first contact list to start adding phone numbers
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyContactListsState;
