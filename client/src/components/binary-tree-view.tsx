import { useState } from "react";
import { User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackageBadge } from "@/components/package-badge";
import { ChevronDown, ChevronRight, User as UserIcon, Users, Phone, Mail, MapPin, Crown } from "lucide-react";

interface TreeNode {
  user: User;
  children: TreeNode[];
  isExpanded: boolean;
}

interface BinaryTreeViewProps {
  users: User[];
  currentUser: User;
  isAdmin: boolean;
}

export function BinaryTreeView({ users, currentUser, isAdmin }: BinaryTreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Build tree structure
  const buildTree = (rootUserId: string | null, allUsers: User[]): TreeNode[] => {
    return allUsers
      .filter(user => user.parentId === rootUserId)
      .map(user => ({
        user,
        children: buildTree(user.id, allUsers),
        isExpanded: expandedNodes.has(user.id)
      }))
      .sort((a, b) => {
        // Sort by position: left first, then right, then no position
        const positionOrder = { left: 1, right: 2, null: 3 };
        const aPos = positionOrder[a.user.position as keyof typeof positionOrder] || 3;
        const bPos = positionOrder[b.user.position as keyof typeof positionOrder] || 3;
        return aPos - bPos;
      });
  };

  // Get full community tree (admin only)
  const getFullCommunityTree = (): TreeNode[] => {
    return buildTree(null, users.filter(u => u.role === 'client'));
  };

  // Get user's downline tree
  const getUserDownlineTree = (userId: string): TreeNode[] => {
    return buildTree(userId, users);
  };

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getParentUser = (parentId: string | null): User | null => {
    if (!parentId) return null;
    return users.find(u => u.id === parentId) || null;
  };

  const TreeNodeComponent = ({ node, level = 0 }: { node: TreeNode; level?: number }) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.user.id);
    
    return (
      <div className="relative" data-testid={`tree-node-${node.user.id}`}>
        {/* Node */}
        <div 
          className="flex items-center space-x-2 p-3 mb-2 bg-card border border-border rounded-lg hover:shadow-md transition-all cursor-pointer"
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => setSelectedUser(node.user)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.user.id);
              }}
              data-testid={`toggle-node-${node.user.id}`}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              {node.user.position && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-xs rounded-full flex items-center justify-center">
                  {node.user.position === 'left' ? 'L' : 'R'}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-foreground" data-testid={`node-username-${node.user.id}`}>
                  {node.user.name || node.user.username}
                </span>
                {node.user.role === 'admin' && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                @{node.user.username}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <PackageBadge package={node.user.package || "Silver"} />
              <Badge variant="outline" className="text-xs">
                {node.children.length} downline
              </Badge>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-4 border-l-2 border-muted pl-4">
            {node.children.map((child, index) => (
              <TreeNodeComponent key={child.user.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const fullCommunityTree = isAdmin ? getFullCommunityTree() : [];
  const userDownlineTree = getUserDownlineTree(currentUser.id);
  const parentUser = getParentUser(currentUser.parentId);

  return (
    <div className="space-y-6">
      <Tabs defaultValue={isAdmin ? "community" : "downline"} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {isAdmin && (
            <TabsTrigger value="community" data-testid="tab-community-tree">
              <Users className="h-4 w-4 mr-2" />
              Full Community Tree
            </TabsTrigger>
          )}
          <TabsTrigger value="downline" data-testid="tab-my-tree">
            <UserIcon className="h-4 w-4 mr-2" />
            My Tree (Downline)
          </TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="community" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Full Community Tree
                </CardTitle>
                <CardDescription>
                  Complete hierarchical view of all clients in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto space-y-2" data-testid="community-tree-container">
                  {fullCommunityTree.length > 0 ? (
                    fullCommunityTree.map(node => (
                      <TreeNodeComponent key={node.user.id} node={node} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No clients in the system yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="downline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                My Tree (Downline)
              </CardTitle>
              <CardDescription>
                Your personal downline network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current User Info */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-foreground">
                            {currentUser.name || currentUser.username} (You)
                          </span>
                          {currentUser.role === 'admin' && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{currentUser.username}
                        </div>
                        {parentUser && (
                          <div className="text-xs text-muted-foreground">
                            Under: {parentUser.name || parentUser.username}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <PackageBadge package={currentUser.package || "Silver"} />
                      <Badge variant="outline">
                        {userDownlineTree.length} direct downline
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Downline Tree */}
                <div className="max-h-96 overflow-y-auto space-y-2" data-testid="downline-tree-container">
                  {userDownlineTree.length > 0 ? (
                    userDownlineTree.map(node => (
                      <TreeNodeComponent key={node.user.id} node={node} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No downline members yet. Start building your network!
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-lg">{selectedUser.name || selectedUser.username}</h3>
                    {selectedUser.role === 'admin' && (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
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
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{selectedUser.position} side</span>
                  </div>
                )}
              </div>

              {/* Parent and Children Info */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2">Network Position</h4>
                  <div className="text-sm text-muted-foreground">
                    Parent: {getParentUser(selectedUser.parentId)?.username || "Direct Client"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Direct Downline: {users.filter(u => u.parentId === selectedUser.id).length}
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