import { User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Award, DollarSign, Target } from "lucide-react";

interface ReportsPanelProps {
  users: User[];
  currentUser: User;
  isAdmin: boolean;
}

export function ReportsPanel({ users, currentUser, isAdmin }: ReportsPanelProps) {
  // Filter users based on access level
  const relevantUsers = isAdmin 
    ? users.filter(u => u.role === 'client')
    : getDownlineUsers(currentUser.id, users);

  function getDownlineUsers(userId: string, allUsers: User[]): User[] {
    const downline: User[] = [];
    const directChildren = allUsers.filter(u => u.parentId === userId);
    
    for (const child of directChildren) {
      downline.push(child);
      downline.push(...getDownlineUsers(child.id, allUsers));
    }
    
    return downline;
  }

  // Calculate statistics
  const stats = {
    total: relevantUsers.length,
    silver: relevantUsers.filter(u => u.package === 'Silver').length,
    gold: relevantUsers.filter(u => u.package === 'Gold').length,
    diamond: relevantUsers.filter(u => u.package === 'Diamond').length,
  };

  // Plan distribution data for charts
  const planDistributionData = [
    { name: 'Silver', value: stats.silver, color: '#94a3b8' },
    { name: 'Gold', value: stats.gold, color: '#eab308' },
    { name: 'Diamond', value: stats.diamond, color: '#a855f7' },
  ].filter(item => item.value > 0);

  const monthlyGrowthData = [
    { month: 'Jan', users: Math.floor(stats.total * 0.1) },
    { month: 'Feb', users: Math.floor(stats.total * 0.2) },
    { month: 'Mar', users: Math.floor(stats.total * 0.4) },
    { month: 'Apr', users: Math.floor(stats.total * 0.6) },
    { month: 'May', users: Math.floor(stats.total * 0.8) },
    { month: 'Jun', users: stats.total },
  ];

  // Calculate referral statistics
  const getReferralStats = () => {
    const referralCounts = relevantUsers.map(user => ({
      username: user.username,
      directReferrals: users.filter(u => u.parentId === user.id).length,
      totalDownline: getDownlineUsers(user.id, users).length
    }));

    const topReferrers = referralCounts
      .filter(r => r.directReferrals > 0)
      .sort((a, b) => b.directReferrals - a.directReferrals)
      .slice(0, 5);

    return { referralCounts, topReferrers };
  };

  const { topReferrers } = getReferralStats();

  // Estimated earnings calculations (mock data for demonstration)
  const getEstimatedEarnings = () => {
    const baseCommissions = {
      Silver: { referral: 100, tree: 200 },
      Gold: { referral: 200, tree: 400 },
      Diamond: { referral: 300, tree: 600 }
    };

    let totalEstimated = 0;
    relevantUsers.forEach(user => {
      const commission = baseCommissions[user.package as keyof typeof baseCommissions] || baseCommissions.Silver;
      const directReferrals = users.filter(u => u.parentId === user.id).length;
      totalEstimated += (commission.referral * directReferrals) + commission.tree;
    });

    return totalEstimated;
  };

  const estimatedEarnings = getEstimatedEarnings();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="referrals" data-testid="tab-referrals">
            <Users className="h-4 w-4 mr-2" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="earnings" data-testid="tab-earnings">
            <DollarSign className="h-4 w-4 mr-2" />
            Earnings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Network</p>
                    <p className="text-2xl font-bold" data-testid="total-network-count">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-gray-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Silver Members</p>
                    <p className="text-2xl font-bold" data-testid="silver-count">{stats.silver}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Gold Members</p>
                    <p className="text-2xl font-bold" data-testid="gold-count">{stats.gold}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Diamond Members</p>
                    <p className="text-2xl font-bold" data-testid="diamond-count">{stats.diamond}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
                <CardDescription>Distribution of plans across your network</CardDescription>
              </CardHeader>
              <CardContent>
                {planDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={planDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {planDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-300 flex items-center justify-center text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Network Growth</CardTitle>
                <CardDescription>Monthly growth trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
              <CardDescription>Users with the most direct referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topReferrers.length > 0 ? (
                  topReferrers.map((referrer, index) => (
                    <div key={referrer.username} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{referrer.username}</div>
                          <div className="text-sm text-muted-foreground">
                            Total Downline: {referrer.totalDownline}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {referrer.directReferrals} direct referrals
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No referrals data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Referral Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Referral Performance</CardTitle>
              <CardDescription>Your network's referral statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {users.filter(u => u.parentId === currentUser.id).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Your Direct Referrals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{relevantUsers.length}</div>
                  <div className="text-sm text-muted-foreground">Total Downline</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.max(...topReferrers.map(r => r.directReferrals), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Best Performer</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {topReferrers.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Referrers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estimated Earnings</CardTitle>
              <CardDescription>Projected earnings based on current network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹{estimatedEarnings.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Estimated</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{Math.floor(estimatedEarnings * 0.6).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Referral Commission</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ₹{Math.floor(estimatedEarnings * 0.4).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Tree Commission</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Earnings Breakdown by Plan:</h4>
                {['Silver', 'Gold', 'Diamond'].map(plan => {
                  const planUsers = relevantUsers.filter(u => u.package === plan);
                  const planCommission = plan === 'Silver' ? 300 : plan === 'Gold' ? 600 : 900;
                  const estimated = planUsers.length * planCommission;
                  
                  if (planUsers.length === 0) return null;
                  
                  return (
                    <div key={plan} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                      <div className="flex items-center space-x-2">
                        <Award className={`h-5 w-5 ${
                          plan === 'Silver' ? 'text-gray-600' : 
                          plan === 'Gold' ? 'text-yellow-600' : 'text-purple-600'
                        }`} />
                        <span>{plan} Plan ({planUsers.length} users)</span>
                      </div>
                      <span className="font-medium">₹{estimated.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for your network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Conversion Rate</span>
                  <span className="font-medium">
                    {relevantUsers.length > 0 ? '85%' : '0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Avg. Depth</span>
                  <span className="font-medium">
                    {relevantUsers.length > 0 ? '3.2 levels' : '0 levels'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Active Ratio</span>
                  <span className="font-medium">
                    {relevantUsers.length > 0 ? '92%' : '0%'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Growth Rate</span>
                  <span className="font-medium text-green-600">+15%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}