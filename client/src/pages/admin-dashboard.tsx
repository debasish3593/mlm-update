import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { clearAuth } from "@/lib/auth";
import { useAuthStore } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PackageBadge } from "@/components/package-badge";
import { Users, Award, Medal, Gem, LogOut, Eye, Edit } from "lucide-react";
import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  // Queries
  const { data: clients = [], isLoading: clientsLoading } = useQuery<User[]>({
    queryKey: ['/api/clients'],
  });

  const { data: stats } = useQuery<{ total: number; silver: number; gold: number; diamond: number }>({
    queryKey: ['/api/stats'],
  });

  // Mutations
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      clearAuth();
      logout(); // Also clear the Zustand store
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (username: string) => {
    return username.split('_').map(part => part.charAt(0).toUpperCase()).join('').slice(0, 2);
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      "bg-primary",
      "bg-secondary", 
      "bg-accent",
      "bg-orange-500",
      "bg-purple-500",
      "bg-pink-500",
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return "Direct Client";
    const parent = clients.find(c => c.id === parentId);
    return parent ? parent.username : "Unknown";
  };

  const getDownlineCount = (clientId: string) => {
    return clients.filter(c => c.parentId === clientId).length;
  };

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
                <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">
                  Admin Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground" data-testid="text-user-info">
                  Welcome, Admin User
                </span>
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
        </header>

        <div className="p-6">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">
              Client Management Overview
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage all clients and their hierarchical structures
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-total-clients">
                      {stats?.total || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Award className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Silver Package</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-silver-clients">
                      {stats?.silver || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Medal className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Gold Package</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-gold-clients">
                      {stats?.gold || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Gem className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Diamond Package</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-diamond-clients">
                      {stats?.diamond || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>



        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mr-4"></div>
                <span>Loading clients...</span>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Downline Count</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-slate-50" data-testid={`row-client-${client.id}`}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`h-8 w-8 ${getAvatarColor(client.username)} rounded-full flex items-center justify-center`}>
                            <span className="text-white text-sm font-medium">{getInitials(client.username)}</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-slate-900" data-testid={`text-username-${client.id}`}>
                              {client.username}
                            </div>
                            <div className="text-sm text-slate-500">ID: {client.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PackageBadge package={client.package || "Silver"} />
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {getParentName(client.parentId)}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {client.position || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-900">
                        {getDownlineCount(client.id)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" data-testid={`button-view-${client.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`button-edit-${client.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {clients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No clients found. Use "Add Client" from the sidebar to create your first client.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
