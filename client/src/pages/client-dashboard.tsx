import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateClientRequest, createClientSchema, User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { clearAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BinaryTree } from "@/components/binary-tree";
import { PackageBadge } from "@/components/package-badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Network, UserPlus, LogOut, Users, CheckCircle, Table } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import logoPath from "@assets/logo_1755178929997.png";

export default function ClientDashboard() {
  const [selectedPosition, setSelectedPosition] = useState<"left" | "right" | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/auth/me'],
  });

  const { data: downlineClients = [], isLoading: downlineLoading } = useQuery<User[]>({
    queryKey: ['/api/clients/downline'],
  });

  // Form for adding new downline client
  const form = useForm<CreateClientRequest>({
    resolver: zodResolver(createClientSchema.omit({ parentId: true })),
    defaultValues: {
      username: "",
      password: "",
      package: "Silver",
      position: "left",
    },
  });

  // Mutations
  const createDownlineMutation = useMutation({
    mutationFn: async (data: CreateClientRequest) => {
      const response = await apiRequest("POST", "/api/clients/downline", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients/downline'] });
      form.reset();
      setIsAddDialogOpen(false);
      setSelectedPosition(null);
      toast({
        title: "Downline Client Added",
        description: "New client has been successfully added to your downline.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create downline client",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      clearAuth();
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  const onSubmit = (data: CreateClientRequest) => {
    if (selectedPosition) {
      createDownlineMutation.mutate({ ...data, position: selectedPosition });
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleAddClient = (position: "left" | "right") => {
    setSelectedPosition(position);
    form.setValue("position", position);
    setIsAddDialogOpen(true);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const leftChild = downlineClients.find(c => c.position === "left");
  const rightChild = downlineClients.find(c => c.position === "right");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src={logoPath} 
                  alt="Napping Hand Academy" 
                  className="h-8 w-8 rounded-full mr-3"
                />
                <h1 className="text-xl font-bold text-slate-800" data-testid="text-app-title">
                  Napping Hand Academy - Client Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground" data-testid="text-user-info">
                Welcome, {currentUser.username}
              </span>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Profile Header */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" data-testid="text-welcome-message">
                Welcome back, {currentUser.username}!
              </h1>
              <p className="text-blue-100 mt-2">
                Client ID: {currentUser.id.slice(0, 8)} • Package: {currentUser.package}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-sm text-blue-100">Total Downline</div>
                <div className="text-2xl font-bold" data-testid="text-downline-count">
                  {downlineClients.length} Clients
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Client Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-primary" data-testid="stat-left-downline">
                      {leftChild ? 1 : 0}
                    </div>
                    <div className="text-sm text-slate-600">Left Downline</div>
                  </div>
                  <div className="text-center p-4 bg-secondary/10 rounded-lg">
                    <div className="text-2xl font-bold text-secondary" data-testid="stat-right-downline">
                      {rightChild ? 1 : 0}
                    </div>
                    <div className="text-sm text-slate-600">Right Downline</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Package Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    <span className="text-slate-700">Advanced Analytics</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    <span className="text-slate-700">Priority Support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success mr-3" />
                    <span className="text-slate-700">Enhanced Commission</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Add Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 text-primary mr-2" />
                Quick Add Downline
              </CardTitle>
              <CardDescription>
                Add new clients to your left or right downline positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleAddClient("left")}
                  disabled={!!leftChild}
                  variant={leftChild ? "secondary" : "default"}
                  className="h-20 flex flex-col space-y-2"
                  data-testid="button-add-left-quick"
                >
                  <Users className="h-6 w-6" />
                  <span>Add Left</span>
                  {leftChild && <span className="text-xs">Occupied</span>}
                </Button>
                <Button
                  onClick={() => handleAddClient("right")}
                  disabled={!!rightChild}
                  variant={rightChild ? "secondary" : "default"}
                  className="h-20 flex flex-col space-y-2"
                  data-testid="button-add-right-quick"
                >
                  <Users className="h-6 w-6" />
                  <span>Add Right</span>
                  {rightChild && <span className="text-xs">Occupied</span>}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Binary Tree Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Table className="h-5 w-5 text-primary mr-2" />
              Your Downline Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            {downlineLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mr-4"></div>
                <span>Loading downline structure...</span>
              </div>
            ) : (
              <BinaryTree
                user={currentUser}
                leftChild={leftChild}
                rightChild={rightChild}
                onAddClient={handleAddClient}
                showAddButtons={true}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Downline Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Downline Client</DialogTitle>
            <DialogDescription>
              Add a new client to your {selectedPosition} downline position.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} data-testid="input-downline-username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} data-testid="input-downline-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="package"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-downline-package">
                          <SelectValue placeholder="Select package" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Silver">Silver</SelectItem>
                        <SelectItem value="Gold">Gold</SelectItem>
                        <SelectItem value="Diamond">Diamond</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="flex-1"
                  data-testid="button-cancel-add"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createDownlineMutation.isPending}
                  className="flex-1"
                  data-testid="button-confirm-add"
                >
                  {createDownlineMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add to {selectedPosition}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
