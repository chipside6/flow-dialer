
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCcw, Server } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Schema for the trunk name form
const trunkNameSchema = z.object({
  trunkName: z.string().min(3, "Trunk name must be at least 3 characters").max(50, "Trunk name must be at most 50 characters")
});

interface CredentialGeneratorProps {
  isGenerating: boolean;
  onGenerate: (data: z.infer<typeof trunkNameSchema>) => void;
}

export const CredentialGenerator = ({ isGenerating, onGenerate }: CredentialGeneratorProps) => {
  // Form for trunk name
  const form = useForm<z.infer<typeof trunkNameSchema>>({
    resolver: zodResolver(trunkNameSchema),
    defaultValues: {
      trunkName: "GoIP Trunk"
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-4">
        <FormField
          control={form.control}
          name="trunkName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trunk Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter a name for your SIP trunk" />
              </FormControl>
              <FormDescription>
                This name will help you identify these credentials in your GoIP configuration.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Server className="h-4 w-4 mr-2" />
                Generate SIP Credentials
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
