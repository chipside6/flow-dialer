
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContactList } from "@/hooks/useContactLists";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// CSV format schema
const FILE_TYPES = ["text/csv", "application/vnd.ms-excel"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface CreateContactListFormProps {
  onListCreated: (data: Omit<ContactList, 'id' | 'contactCount' | 'dateCreated' | 'lastModified'>) => Promise<ContactList | null>;
  onFileUpload?: (file: File, listName: string, description?: string) => Promise<void>;
}

const CreateContactListForm: React.FC<CreateContactListFormProps> = ({ onListCreated, onFileUpload }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"manual" | "csv">("manual");
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!FILE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Contact List</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual" onValueChange={(value) => setUploadMode(value as "manual" | "csv")}>
          <TabsList className="mb-4">
            <TabsTrigger value="manual">Create Empty List</TabsTrigger>
            <TabsTrigger value="csv">Upload Contacts</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="My Contact List" disabled={isCreating} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for your contact list
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="Enter a description for this list" 
                        rows={3}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <TabsContent value="csv" className="mt-0 space-y-4">
                <FormItem>
                  <FormLabel>Upload Contacts (CSV)</FormLabel>
                  <FormControl>
                    <div className="border border-input bg-background rounded-md px-3 py-2">
                      <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium mb-1">
                          {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          CSV files only (max 5MB)
                        </span>
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={isCreating || isUploading}
                        />
                      </label>
                    </div>
                  </FormControl>
                  <FormDescription>
                    CSV should have headers: first_name, last_name, phone_number, email (optional)
                  </FormDescription>
                </FormItem>
              </TabsContent>
              
              <Button type="submit" disabled={isCreating || isUploading || (uploadMode === "csv" && !selectedFile)}>
                {isCreating || isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    {isUploading ? "Uploading Contacts..." : "Creating..."}
                  </>
                ) : (
                  uploadMode === "csv" ? "Create & Upload Contacts" : "Create Contact List"
                )}
              </Button>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CreateContactListForm;
