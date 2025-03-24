
import React from "react";
import { FormField, FormControl, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input"; // Assuming you are using a custom Input component

const ListDetailsForm = ({ form, isDisabled }: { form: any; isDisabled: boolean }) => {
  return (
    <div className="space-y-4">
      {/* List Name Input */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>List Name</FormLabel>
            <FormControl>
              <Input {...field} disabled={isDisabled} placeholder="Enter list name" />
            </FormControl>
            <FormDescription>
              Provide a name for your contact list.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* List Description Input */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input {...field} disabled={isDisabled} placeholder="Enter description" />
            </FormControl>
            <FormDescription>
              Provide a brief description of your contact list.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ListDetailsForm;
