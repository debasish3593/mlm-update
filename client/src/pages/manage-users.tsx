import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSidebar } from "@/components/admin-sidebar";
import { PackageBadge } from "@/components/package-badge";
import { BinaryTreeView } from "@/components/binary-tree-view";
import { ReportsPanel } from "@/components/reports-panel";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Search, Eye, UserPlus, Phone, Mail, Calendar, Network, BarChart3, TrendingUp, Share2, DollarSign } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "@/hooks/use-auth";

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { user: currentUser } = useAuthStore();
  const [location] = useLocation();

  // Determine active tab based on route
  const activeTab = useMemo(() => {
    if (location.includes('/binary-tree')) return 'tree';
    if (location.includes('/reports')) return 'reports';
    if (location.includes('/overview')) return 'overview';
    if (location.includes('/referrals')) return 'referrals';
    if (location.includes('/earnings')) return 'earnings';
    return 'users';
  }, [location]);

  // Fetch all clients with real-time updates
  const { data: clients = [], isLoading, refetch } = useQuery<User[]>({
    queryKey: ['/api/clients'],
    refetchInterval: 5000, // Auto-refresh every 5 seconds to show new clients
  });

  const isAdmin = currentUser?.role === 'admin';

  // Filter users based on access level
  const getRelevantUsers = (): User[] => {
    if (isAdmin) {
      return clients; // Admin sees all clients
    } else if (currentUser) {
      // Client sees only their downline
      return getDownlineUsers(currentUser.id, clients);
    }
    return [];
  };

  const getDownlineUsers = (userId: string, allUsers: User[]): User[] => {
    const downline: User[] = [];
    const directChildren = allUsers.filter(u => u.parentId === userId);
    
    for (const child of directChildren) {
      downline.push(child);
      downline.push(...getDownlineUsers(child.id, allUsers));
    }
    
    return downline;
  };

  const relevantUsers = getRelevantUsers();

  // Filter users based on search term
  const filteredClients = relevantUsers.filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.mobile?.includes(searchTerm)
  );

  const getParentName = (parentId: string | null) => {
    if (!parentId) return "Direct Client";
    const parent = clients.find(c => c.id === parentId);
    return parent ? (parent.name || parent.username) : "Unknown";
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

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
                <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">
                  Manage Users
                </h1>
                <Badge variant="secondary" className="ml-2">
                  {relevantUsers.length} Total {isAdmin ? 'Clients' : 'Network Members'}
                </Badge>
              </div>
              {isAdmin && (
                <Link href="/admin/add-client">
                  <Button data-testid="button-add-new-client">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Client
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs value={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="users" data-testid="tab-all-users">
                <Users className="h-4 w-4 mr-2" />
                All Users
              </TabsTrigger>
              <TabsTrigger value="tree" data-testid="tab-binary-tree">
                <Network className="h-4 w-4 mr-2" />
                Binary Tree
              </TabsTrigger>
              <TabsTrigger value="reports" data-testid="tab-reports">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="overview" data-testid="tab-overview">
                <TrendingUp className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="referrals" data-testid="tab-referrals">
                <Share2 className="h-4 w-4 mr-2" />
                Referrals
              </TabsTrigger>
              <TabsTrigger value="earnings" data-testid="tab-earnings">
                <DollarSign className="h-4 w-4 mr-2" />
                Earnings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              {/* All Users Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {isAdmin ? 'All Clients Directory' : 'My Network'}
                  </CardTitle>
                  <CardDescription>
                    {isAdmin 
                      ? 'Search and manage all registered clients in the system'
                      : 'View and manage your downline network members'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search by name, username, email, or mobile..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-clients"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => refetch()}
                      disabled={isLoading}
                      data-testid="button-refresh-clients"
                    >
                      {isLoading ? "Loading..." : "Refresh"}
                    </Button>
                  </div>

                  {/* Users Table */}
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-muted-foreground">Loading users...</span>
                    </div>
                  ) : filteredClients.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        {searchTerm ? "No users found" : "No network members yet"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm 
                          ? "Try adjusting your search terms"
                          : isAdmin 
                            ? "Start by adding your first client to the system"
                            : "Your network is empty. Start building your downline!"
                        }
                      </p>
                      {!searchTerm && isAdmin && (
                        <Link href="/admin/add-client">
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add First Client
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Parent</TableHead>
                            <TableHead>Position</TableHead>
                            {isAdmin && <TableHead>Joined</TableHead>}
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredClients.map((client) => (
                            <TableRow 
                              key={client.id} 
                              className="hover:bg-muted/50"
                              data-testid={`row-client-${client.id}`}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-medium text-primary">
                                      {(client.name || client.username).charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground">
                                      {client.name || client.username}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      @{client.username}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {client.email && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Mail className="h-3 w-3 mr-1" />
                                      {client.email}
                                    </div>
                                  )}
                                  {client.mobile && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Phone className="h-3 w-3 mr-1" />
                                      {client.mobile}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <PackageBadge package={client.package || "Silver"} />
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {getParentName(client.parentId)}
                              </TableCell>
                              <TableCell>
                                {client.position && (
                                  <Badge variant="outline" className="text-xs">
                                    {client.position} side
                                  </Badge>
                                )}
                              </TableCell>
                              {isAdmin && (
                                <TableCell className="text-sm text-muted-foreground">
                                  {client.createdAt && (
                                    <div className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {formatDate(client.createdAt)}
                                    </div>
                                  )}
                                </TableCell>
                              )}
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewDetails(client)}
                                  data-testid={`button-view-${client.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tree" className="space-y-4">
              {currentUser && (
                <BinaryTreeView 
                  users={clients} 
                  currentUser={currentUser} 
                  isAdmin={isAdmin} 
                />
              )}
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              {currentUser && (
                <ReportsPanel 
                  users={clients} 
                  currentUser={currentUser} 
                  isAdmin={isAdmin} 
                />
              )}
            </TabsContent>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Network Overview
                  </CardTitle>
                  <CardDescription>
                    Summary of your network performance and growth metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{relevantUsers.length}</div>
                      <div className="text-sm text-muted-foreground">Total Network Size</div>
                    </div>
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {relevantUsers.filter(u => u.package === 'Gold' || u.package === 'Diamond').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Premium Members</div>
                    </div>
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentUser && getDownlineUsers(currentUser.id, clients).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Direct Downline</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referrals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="h-5 w-5 mr-2" />
                    Referral Network
                  </CardTitle>
                  <CardDescription>
                    Track your referrals and their performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-lg font-semibold">Direct Referrals</div>
                        <div className="text-2xl font-bold text-primary">
                          {currentUser ? clients.filter(u => u.parentId === currentUser.id).length : 0}
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-lg font-semibold">Total Network</div>
                        <div className="text-2xl font-bold text-green-600">
                          {currentUser ? getDownlineUsers(currentUser.id, clients).length : 0}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h3 className="font-medium mb-4">Recent Referrals</h3>
                      {currentUser && clients.filter(u => u.parentId === currentUser.id).length > 0 ? (
                        <div className="space-y-2">
                          {clients.filter(u => u.parentId === currentUser.id).slice(0, 5).map(client => (
                            <div key={client.id} className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-medium">
                                    {(client.name || client.username).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{client.name || client.username}</div>
                                  <div className="text-sm text-muted-foreground">@{client.username}</div>
                                </div>
                              </div>
                              <PackageBadge package={client.package || 'Silver'} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No direct referrals yet. Start building your network!
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="earnings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Earnings Overview
                  </CardTitle>
                  <CardDescription>
                    Track your commissions and earnings from the network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">₹0</div>
                      <div className="text-sm text-muted-foreground">Total Earnings</div>
                    </div>
                    <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">₹0</div>
                      <div className="text-sm text-muted-foreground">This Month</div>
                    </div>
                    <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">₹0</div>
                      <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Recent Transactions</h3>
                    <div className="text-center py-8 text-muted-foreground">
                      No earnings transactions yet. Earnings will appear here as your network grows.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">
                    {(selectedUser.name || selectedUser.username).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {selectedUser.name || selectedUser.username}
                  </h3>
                  <p className="text-muted-foreground">@{selectedUser.username}</p>
                  <PackageBadge package={selectedUser.package || "Silver"} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {selectedUser.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedUser.email}</span>
                  </div>
                )}
                {selectedUser.mobile && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedUser.mobile}</span>
                  </div>
                )}
                {selectedUser.position && (
                  <div className="flex items-center space-x-2">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Position: {selectedUser.position} side</span>
                  </div>
                )}
                {selectedUser.createdAt && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Joined: {formatDate(selectedUser.createdAt)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Network Position</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Parent: {getParentName(selectedUser.parentId)}</div>
                  <div>
                    Direct Downline: {clients.filter(u => u.parentId === selectedUser.id).length}
                  </div>
                  <div>
                    Total Downline: {getDownlineUsers(selectedUser.id, clients).length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}