
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Schema for form validation
export const listFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional()
});

// Type for form values
export type ListFormValues = z.infer<typeof listFormSchema>;

interface ListDetailsFormProps {
  form: UseFormReturn<ListFormValues>;
  isDisabled: boolean;
}

const ListDetailsForm: React.FC<ListDetailsFormProps> = ({ form, isDisabled }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>List Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="My Contact List" disabled={isDisabled} />
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
                disabled={isDisabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ListDetailsForm;
