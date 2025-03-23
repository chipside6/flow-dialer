
import React, { useState, useEffect } from "react";
import CreateContactListForm from "@/components/contact-lists/CreateContactListForm";
import EmptyContactListsState from "@/components/contact-lists/EmptyContactListsState";
import ContactListsDisplay from "@/components/contact-lists/ContactListsDisplay";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useContactLists } from "@/hooks/useContactLists";
import { Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const ContactLists = () => {
  const { user } = useAuth();
  const { 
    lists, 
    isLoading, 
    error, 
    createContactList, 
    deleteContactList,
    uploadContactsWithNewList,
    refreshLists
  } = useContactLists();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Add an effect to handle persistently stuck loading states
  useEffect(() => {
    // If loading takes more than 10 seconds, show timeout message
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setLoadingTimeout(true);
      }
    }, 10000);
    
    // If not loading anymore, reset the timeout state
    if (!isLoading) {
      setLoadingTimeout(false);
    }
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);
  
  // Handle manual refresh
  const handleRefresh = () => {
    refreshLists();
  };
  
  console.log("Contact Lists page render - user:", user?.id);
  console.log("Contact Lists page render - lists:", lists);
  console.log("Contact Lists loading state:", isLoading);
  console.log("Contact Lists error state:", error);
  
  return (
    <DashboardLayout>
      <div className="container-fluid overflow-x-hidden w-full">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Contact Lists</h1>
          
          {loadingTimeout ? (
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              onClick={handleRefresh}
              className="flex items-center gap-2"
              size="sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Lists
            </Button>
          )}
        </div>
        
        <CreateContactListForm 
          onListCreated={createContactList} 
          onFileUpload={uploadContactsWithNewList}
        />
        
        {isLoading && !loadingTimeout ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : loadingTimeout ? (
          <div className="flex flex-col justify-center items-center py-12 space-y-4">
            <p className="text-center text-muted-foreground">
              It's taking longer than expected to load your contact lists.
            </p>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center py-12 space-y-4">
            <p className="text-center text-destructive">
              Error loading contact lists: {error.message || "Unknown error"}
            </p>
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : lists.length === 0 ? (
          <EmptyContactListsState />
        ) : (
          <ContactListsDisplay lists={lists} onDelete={deleteContactList} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContactLists;
