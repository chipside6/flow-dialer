
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Calendar, Target, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const campaignSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  goal: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Goal must be a positive number",
  }),
  deadline: z.string().refine((val) => {
    const date = new Date(val);
    return date > new Date();
  }, {
    message: "Deadline must be in the future",
  }),
});

const Campaign = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof campaignSchema>>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      description: "",
      goal: "",
      deadline: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof campaignSchema>) => {
    try {
      // In a real app, you would send this data to your backend
      console.log("Campaign data:", values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsDialogOpen(false);
      
      toast({
        title: "Campaign created!",
        description: "Your campaign has been created successfully.",
      });
      
      // Reset form
      form.reset();
      
      // In a real application, you might redirect to the campaign page
      // navigate(`/campaigns/${campaignId}`);
    } catch (error) {
      toast({
        title: "Failed to create campaign",
        description: "There was an error creating your campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-20 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6">
              Start Your Campaign
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Create your own campaign and share it with the world. Get funding, support, and help your ideas come to life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-border/40 shadow-md">
              <CardHeader className="text-center">
                <Target className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Define Your Goal</CardTitle>
                <CardDescription>
                  Set clear objectives and targets for your campaign.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-border/40 shadow-md">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Reach Your Audience</CardTitle>
                <CardDescription>
                  Share your campaign with supporters and potential backers.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-border/40 shadow-md">
              <CardHeader className="text-center">
                <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Set a Timeline</CardTitle>
                <CardDescription>
                  Create a deadline to drive urgency and commitment.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
          
          <div className="max-w-md mx-auto text-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="group">
                  Create Campaign <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create a new campaign</DialogTitle>
                  <DialogDescription>
                    Fill in the details to start your new campaign.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Give your campaign a catchy title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your campaign and what you hope to achieve" 
                              className="resize-none h-20"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal Amount</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" placeholder="Enter amount" {...field} />
                          </FormControl>
                          <FormDescription>How much do you need to raise?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="deadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>When will your campaign end?</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter className="mt-6">
                      <Button type="submit">Create Campaign</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Campaign;
