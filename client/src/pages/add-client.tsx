import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { createClientSchema, CreateClientRequest, planPricing, Plan } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminSidebar } from "@/components/admin-sidebar";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/hooks/use-auth";
import { UserPlus, CreditCard, ArrowLeft, Users } from "lucide-react";
import { Link } from "wouter";

export default function AddClient() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser } = useAuthStore();

  // Fetch available plans from the API
  const { data: plans, isLoading: plansLoading } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
  });

  const form = useForm<CreateClientRequest>({
    resolver: zodResolver(createClientSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      mobile: "",
      email: "",
      package: undefined,
      parentId: currentUser?.id || null,
      position: null
    }
  });

  const onSubmit = async (data: CreateClientRequest) => {
    setIsSubmitting(true);
    try {
      // Ensure parentId is set to current user's ID
      const clientData = {
        ...data,
        parentId: currentUser?.id || null
      };
      
      // Store client data in sessionStorage for the payment page
      sessionStorage.setItem('pendingClientData', JSON.stringify(clientData));
      
      // Navigate to payment page
      setLocation('/admin/payment');
      
      toast({
        title: "Form validated successfully",
        description: "Proceeding to payment page..."
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to process form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlan = form.watch("package");
  const selectedPlanData = plans?.find(plan => plan.name === selectedPlan);
  const planAmount = selectedPlan ? planPricing[selectedPlan] : 0;

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Top Header */}
        <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 lg:ml-0 ml-12">
                <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">
                  Add New Client
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <UserPlus className="h-6 w-6 text-primary mr-3" />
                Create New Client Account
              </CardTitle>
              <CardDescription>
                Fill in the client details below. After validation, you'll proceed to the payment page.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter client's full name" 
                            {...field} 
                            data-testid="input-client-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Username Field */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Choose a unique username for login" 
                            {...field} 
                            data-testid="input-client-username"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          This will be used for client login. Only letters, numbers, and underscores allowed.
                        </p>
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="Create a secure password" 
                            {...field} 
                            data-testid="input-client-password"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Minimum 6 characters. Can include letters, numbers, and symbols.
                        </p>
                      </FormItem>
                    )}
                  />

                  {/* Mobile Number Field */}
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter 10-digit mobile number" 
                            {...field} 
                            data-testid="input-client-mobile"
                            maxLength={10}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">
                          Enter exactly 10 digits without country code.
                        </p>
                      </FormItem>
                    )}
                  />

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Enter valid email address" 
                            {...field} 
                            data-testid="input-client-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Parent ID Field (Hidden/Display Only) */}
                  {currentUser && (
                    <FormField
                      control={form.control}
                      name="parentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent/Sponsor *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="p-3 bg-muted/50 rounded-lg border">
                                <div className="flex items-center space-x-3">
                                  <Users className="h-5 w-5 text-primary" />
                                  <div>
                                    <div className="font-medium text-foreground">
                                      {currentUser.name || currentUser.username}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      @{currentUser.username} ({currentUser.role})
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <input type="hidden" {...field} value={currentUser.id} />
                            </div>
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            This client will be added under your network as a direct downline.
                          </p>
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Plan Selection */}
                  <FormField
                    control={form.control}
                    name="package"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Plan *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-client-plan">
                              <SelectValue placeholder="Choose a plan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {plansLoading ? (
                              <div className="p-2 text-center text-muted-foreground">Loading plans...</div>
                            ) : plans && plans.filter(plan => plan.status === 'active').length > 0 ? (
                              plans.filter(plan => plan.status === 'active').map((plan) => (
                                <SelectItem key={plan.id} value={plan.name}>
                                  {plan.name} Plan - {plan.price}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-muted-foreground">No active plans available</div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {selectedPlan && selectedPlanData && (
                          <div className="mt-2 p-3 bg-primary/5 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground">
                                {selectedPlan} Plan Selected
                              </span>
                              <span className="text-lg font-bold text-primary">
                                {selectedPlanData.price}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Business Volume:</span>
                                <span className="ml-1 font-medium">{selectedPlanData.businessVolume} BV</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Referral:</span>
                                <span className="ml-1 font-medium">{selectedPlanData.referralCommission}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-lg"
                      disabled={isSubmitting}
                      data-testid="button-proceed-payment"
                    >
                      {isSubmitting ? (
                        "Validating..."
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Proceed to Payment {selectedPlan && selectedPlanData && `(${selectedPlanData.price})`}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}