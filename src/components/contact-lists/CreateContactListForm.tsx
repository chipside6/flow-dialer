
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

  // Function to handle the actual upload (simulated here with a delay)
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Simulate file upload (replace with actual file upload logic)
      const formData = new FormData();
      formData.append("file", file);

      // Here you would make an API call to your backend to upload the file
      // For example, use fetch() or axios to upload the file
      const response = await fetch("/upload-endpoint", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      toast({
        title: "File uploaded",
        description: `Your file ${file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an issue uploading the file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ListFormValues) => {
    try {
      setIsCreating(true);

      if (uploadMode === "csv" && selectedFile) {
        await handleFileUpload(selectedFile);
      } else {
        // Simulate list creation
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate creation delay

        toast({
          title: "List Created",
          description: `"${data.name}" has been created successfully`,
        });
      }

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
              onUpload={handleFileUpload} // Pass the onUpload function
            />
            <FormActions
              isSubmitting={isCreating}
              isUploading={isUploading}
              uploadMode={uploadMode}
              hasSelectedFile={!!selectedFile}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateContactListForm;

