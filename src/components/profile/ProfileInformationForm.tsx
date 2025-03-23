import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/auth";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Profile schema validation with only email now
const profileFormSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfileInformationForm() {
  const { user, profile, setProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsUpdating(true);
      
      // If email has changed, update it in auth
      if (data.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (emailError) throw emailError;
        
        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your new address.",
        });
      } else {
        toast({
          title: "No changes detected",
          description: "Your email address remains the same.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "There was an error updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden max-w-full">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your account information
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" className="max-w-full" />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Changing your email will require verification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Email"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
