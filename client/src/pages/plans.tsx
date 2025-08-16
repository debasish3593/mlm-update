import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlanSchema, updatePlanSchema, InsertPlan, UpdatePlan, Plan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PlansPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
  });

  const addPlanForm = useForm<InsertPlan>({
    resolver: zodResolver(insertPlanSchema),
    defaultValues: {
      name: "",
      price: "",
      businessVolume: "",
      referralCommission: "",
      treeCommission: "",
      status: "active"
    }
  });

  const editPlanForm = useForm<UpdatePlan>({
    resolver: zodResolver(updatePlanSchema),
    defaultValues: {}
  });

  const addPlanMutation = useMutation({
    mutationFn: async (planData: InsertPlan) => {
      return await apiRequest('POST', '/api/plans', planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      setIsAddDialogOpen(false);
      addPlanForm.reset();
      toast({
        title: "Plan created successfully",
        description: "The new plan has been added to the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create plan",
        description: error?.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: UpdatePlan }) => {
      return await apiRequest('PUT', `/api/plans/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      setEditingPlan(null);
      editPlanForm.reset();
      toast({
        title: "Plan updated successfully",
        description: "The plan details have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update plan",
        description: error?.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/plans/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plans'] });
      toast({
        title: "Plan deleted successfully",
        description: "The plan has been removed from the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete plan",
        description: error?.message || "Please try again.",
        variant: "destructive"
      });
    }
  });

  const togglePlanStatus = async (plan: Plan) => {
    const newStatus = plan.status === 'active' ? 'disabled' : 'active';
    updatePlanMutation.mutate({
      id: plan.id,
      data: { status: newStatus }
    });
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    editPlanForm.reset({
      name: plan.name,
      price: plan.price,
      businessVolume: plan.businessVolume,
      referralCommission: plan.referralCommission,
      treeCommission: plan.treeCommission,
      status: plan.status
    });
  };

  const onAddSubmit = (data: InsertPlan) => {
    addPlanMutation.mutate(data);
  };

  const onEditSubmit = (data: UpdatePlan) => {
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, data });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:ml-64 transition-all duration-300 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <div className="lg:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 lg:ml-0 ml-12">
                <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Plans Management</h1>
                  <p className="text-sm text-muted-foreground">Manage subscription plans and pricing</p>
                </div>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-plan">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Plan</DialogTitle>
                  </DialogHeader>
                  <Form {...addPlanForm}>
                    <form onSubmit={addPlanForm.handleSubmit(onAddSubmit)} className="space-y-4">
                      <FormField
                        control={addPlanForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plan Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Platinum" {...field} data-testid="input-plan-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addPlanForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., ₹2000.00 INR" {...field} data-testid="input-plan-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addPlanForm.control}
                        name="businessVolume"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Volume (BV)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 400" {...field} data-testid="input-plan-bv" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addPlanForm.control}
                        name="referralCommission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Referral Commission</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., ₹400.00 INR" {...field} data-testid="input-plan-referral" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addPlanForm.control}
                        name="treeCommission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tree Commission</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., ₹800.00 INR" {...field} data-testid="input-plan-tree" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addPlanMutation.isPending} data-testid="button-save-plan">
                          {addPlanMutation.isPending ? "Creating..." : "Create Plan"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Plans Table */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Price</th>
                      <th className="text-left py-3 px-4">Business Volume (BV)</th>
                      <th className="text-left py-3 px-4">Referral Commission</th>
                      <th className="text-left py-3 px-4">Tree Commission</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans?.map((plan) => (
                      <tr key={plan.id} className="border-b hover:bg-muted/50" data-testid={`row-plan-${plan.id}`}>
                        <td className="py-3 px-4 font-medium" data-testid={`text-plan-name-${plan.id}`}>{plan.name}</td>
                        <td className="py-3 px-4" data-testid={`text-plan-price-${plan.id}`}>{plan.price}</td>
                        <td className="py-3 px-4" data-testid={`text-plan-bv-${plan.id}`}>{plan.businessVolume}</td>
                        <td className="py-3 px-4" data-testid={`text-plan-referral-${plan.id}`}>{plan.referralCommission}</td>
                        <td className="py-3 px-4" data-testid={`text-plan-tree-${plan.id}`}>{plan.treeCommission}</td>
                        <td className="py-3 px-4">
                          <Badge variant={plan.status === 'active' ? 'default' : 'secondary'} data-testid={`status-plan-${plan.id}`}>
                            {plan.status === 'active' ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(plan)}
                              data-testid={`button-edit-${plan.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePlanStatus(plan)}
                              data-testid={`button-toggle-${plan.id}`}
                            >
                              {plan.status === 'active' ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deletePlanMutation.mutate(plan.id)}
                              disabled={deletePlanMutation.isPending}
                              data-testid={`button-delete-${plan.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
          </DialogHeader>
          <Form {...editPlanForm}>
            <form onSubmit={editPlanForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editPlanForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Platinum" {...field} data-testid="input-edit-plan-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editPlanForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ₹2000.00 INR" {...field} data-testid="input-edit-plan-price" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editPlanForm.control}
                name="businessVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Volume (BV)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 400" {...field} data-testid="input-edit-plan-bv" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editPlanForm.control}
                name="referralCommission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral Commission</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ₹400.00 INR" {...field} data-testid="input-edit-plan-referral" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editPlanForm.control}
                name="treeCommission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tree Commission</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., ₹800.00 INR" {...field} data-testid="input-edit-plan-tree" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingPlan(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePlanMutation.isPending} data-testid="button-update-plan">
                  {updatePlanMutation.isPending ? "Updating..." : "Update Plan"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}