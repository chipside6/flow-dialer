
import React, { useState } from "react";
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

interface CreateContactListFormProps {
  onListCreated: (data: Omit<ContactList, 'id' | 'contactCount' | 'dateCreated' | 'lastModified'>) => Promise<ContactList | null>;
  onFileUpload?: (file: File, listName: string, description?: string) => Promise<void>;
}

const CreateContactListForm: React.FC<CreateContactListFormProps> = ({ onListCreated, onFileUpload }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"manual" | "csv">("manual");
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<ListFormValues>({
    resolver: zodResolver(listFormSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const onSubmit = async (data: ListFormValues) => {
    try {
      console.log("Form submitted:", data);
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
          } catch (uploadError) {
            console.error("Error uploading contacts:", uploadError);
            toast({
              title: "Error uploading contacts",
              description: "The list was created but we couldn't upload your contacts",
              variant: "destructive"
            });
          }
        }
        setIsUploading(false);
      } else {
        // Just create an empty list
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
        }
      }
      
      // Reset form and states
      form.reset();
      setSelectedFile(null);
    } catch (error) {
      console.error("Error creating contact list:", error);
      toast({
        title: "Error creating contact list",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-xl">Create New Contact List</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="manual" onValueChange={(value) => setUploadMode(value as "manual" | "csv")}>
          <TabsList className="mb-4">
            <TabsTrigger value="manual">Create Empty List</TabsTrigger>
            <TabsTrigger value="csv">Upload Contacts</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ListDetailsForm form={form} isDisabled={isCreating} />
              
              <TabsContent value="csv" className="mt-0 space-y-4">
                <CsvUploader
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  isDisabled={isCreating || isUploading}
                />
              </TabsContent>
              
              <FormActions
                isSubmitting={isCreating}
                isUploading={isUploading}
                uploadMode={uploadMode}
                hasSelectedFile={!!selectedFile}
              />
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CreateContactListForm;
