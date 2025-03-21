
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContactList } from "@/hooks/useContactLists";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface CreateContactListFormProps {
  onListCreated: (data: Omit<ContactList, 'id' | 'contactCount' | 'dateCreated' | 'lastModified'>) => Promise<ContactList | null>;
}

const CreateContactListForm: React.FC<CreateContactListFormProps> = ({ onListCreated }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormValues) => {
    console.log("Form submitted:", data);
    
    const result = await onListCreated({
      name: data.name,
      description: data.description || ""
    });
    
    if (result) {
      console.log("Contact list created successfully:", result);
      form.reset();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Contact List</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>List Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="My Contact List" />
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Contact List"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateContactListForm;
