
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ContactList } from "@/hooks/useContactLists";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListDetailsForm, { listFormSchema, ListFormValues } from "./form-components/ListDetailsForm";
import CsvUploader from "./form-components/CsvUploader";
import FormActions from "./form-components/FormActions";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreateContactListFormProps {
  onListCreated: (data: Omit<ContactList, 'id' | 'contactCount' | 'dateCreated' | 'lastModified'>) => Promise<ContactList | null>;
  onFileUpload?: (file: File, listName: string, description?: string) => Promise<void>;
  requireFileUpload?: boolean;
}

const CreateContactListForm: React.FC<CreateContactListFormProps> = ({ 
  onListCreated, 
  onFileUpload,
  requireFileUpload = false
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"csv">("csv");
  const [isUploading, setIsUploading] = useState(false);
  const isMobile = useIsMobile();
  
  const form = useForm<ListFormValues>({
    resolver: zodResolver(listFormSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  // Force CSV upload mode when requireFileUpload is true
  useEffect(() => {
    if (requireFileUpload) {
      setUploadMode("csv");
    }
  }, [requireFileUpload]);

  const onSubmit = async (data: ListFormValues) => {
    try {
      console.log("Form submitted:", data);
      
      if (requireFileUpload && !selectedFile) {
        toast({
          title: "File required",
          description: "Please upload a CSV file with contacts before creating a list",
          variant: "destructive"
        });
        return;
      }
      
      setIsCreating(true);
      
      if (uploadMode === "csv" && selectedFile && onFileUpload) {
        setIsUploading(true);
        // Create list first, then upload contacts
        const result = await onListCreated({
          name: data.name,
          description: data.description || ""
        });
        
        if (result) {
          // Now upload the contacts file
          try {
            await onFileUpload(selectedFile, data.name, data.description);
            toast({
              title: "Contact list created with uploaded contacts",
              description: `"${data.name}" has been created with your uploaded contacts`,
            });
            form.reset();
            setSelectedFile(null);
          } catch (uploadError: any) {
            console.error("Error uploading contacts:", uploadError);
            toast({
              title: "Error uploading contacts",
              description: uploadError.message || "The list was created but we couldn't upload your contacts",
              variant: "destructive"
            });
          }
        }
        setIsUploading(false);
      } else if (!requireFileUpload) {
        // Just create an empty list (only if not requiring file upload)
        const result = await onListCreated({
          name: data.name,
          description: data.description || ""
        });
        
        if (result) {
          console.log("Contact list created successfully:", result);
          toast({
            title: "Contact list created",
            description: `"${data.name}" has been created successfully`,
          });
          form.reset();
          setSelectedFile(null);
        }
      }
    } catch (error: any) {
      console.error("Error creating contact list:", error);
      toast({
        title: "Error creating contact list",
        description: error.message || "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  return (
    <Card className={isMobile ? "px-1" : ""}>
      <CardHeader className={isMobile ? "px-3 py-4" : ""}>
        <CardTitle>Create New Contact List</CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? "px-3 pb-4" : ""}>
        <Tabs value="csv" onValueChange={(value) => setUploadMode(value as "csv")}>
          {!requireFileUpload && (
            <TabsList className="mb-4">
              <TabsTrigger value="csv">Upload Contacts</TabsTrigger>
            </TabsList>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ListDetailsForm form={form} isDisabled={isCreating || isUploading} />
              
              <div className="mt-0 space-y-4">
                <CsvUploader
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  isDisabled={isCreating || isUploading}
                  required={requireFileUpload}
                />
              </div>
              
              <div className="flex justify-end mt-6">
                <FormActions
                  isSubmitting={isCreating}
                  isUploading={isUploading}
                  uploadMode={uploadMode}
                  hasSelectedFile={!!selectedFile}
                  requireFile={requireFileUpload}
                />
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CreateContactListForm;
