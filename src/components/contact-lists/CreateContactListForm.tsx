
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ListFormValues, listFormSchema } from "./form-components/ListDetailsForm";
import CsvUploader from "./form-components/CsvUploader";
import FormActions from "./form-components/FormActions";

const CreateContactListForm: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<"manual" | "csv">("manual");

  const form = useForm<ListFormValues>({
    resolver: zodResolver(listFormSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const onSubmit = async (data: ListFormValues) => {
    try {
      setIsCreating(true);

      if (uploadMode === "csv" && selectedFile) {
        setIsUploading(true);
        // Simulate upload action
        // Replace with actual file upload logic
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate upload delay

        toast({
          title: "File uploaded",
          description: `Your file ${selectedFile.name} has been uploaded successfully.`,
        });
        setIsUploading(false);
      } else {
        // Simulate list creation
        // Replace with actual list creation logic
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate creation delay

        toast({
          title: "List Created",
          description: `"${data.name}" has been created successfully`,
        });
      }

      // Reset form after submission
      form.reset();
      setSelectedFile(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Contact List</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CsvUploader
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              isDisabled={isCreating || isUploading}
            />
            <FormActions
              isSubmitting={isCreating}
              isUploading={isUploading}
              uploadMode={uploadMode}
              hasSelectedFile={!!selectedFile}
              onSubmit={() => form.handleSubmit(onSubmit)()} // Pass onSubmit here
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateContactListForm;
