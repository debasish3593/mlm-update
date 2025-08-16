import { User } from "@shared/schema";
import { PackageBadge } from "./package-badge";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BinaryTreeProps {
  user: User;
  leftChild?: User;
  rightChild?: User;
  onAddClient?: (position: "left" | "right") => void;
  showAddButtons?: boolean;
}

export function BinaryTree({ user, leftChild, rightChild, onAddClient, showAddButtons = false }: BinaryTreeProps) {
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

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Root Node (Current User) */}
      <div className="relative">
        <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-lg p-4 text-center shadow-lg" data-testid="node-root-user">
          <div className="font-semibold">{user.username}</div>
          <div className="text-sm opacity-90">{user.package} Package</div>
        </div>
      </div>

      {/* Connection Lines */}
      <div className="relative w-64 h-8">
        <div className="absolute top-0 left-1/2 w-px h-4 bg-slate-300 transform -translate-x-px"></div>
        <div className="absolute top-4 left-8 right-8 h-px bg-slate-300"></div>
        <div className="absolute top-4 left-8 w-px h-4 bg-slate-300"></div>
        <div className="absolute top-4 right-8 w-px h-4 bg-slate-300"></div>
      </div>

      {/* Second Level */}
      <div className="flex justify-center space-x-32">
        {/* Left Child */}
        <div className="text-center">
          {leftChild ? (
            <div className="bg-white border-2 border-accent rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow" data-testid={`node-left-${leftChild.id}`}>
              <div className={`w-12 h-12 ${getAvatarColor(leftChild.username)} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <span className="text-white font-medium">{getInitials(leftChild.username)}</span>
              </div>
              <div className="font-medium text-slate-900">{leftChild.username}</div>
              <div className="mb-2">
                <PackageBadge package={leftChild.package || "Silver"} size="sm" />
              </div>
              <div className="text-xs text-slate-500">ID: {leftChild.id.slice(0, 8)}</div>
            </div>
          ) : showAddButtons ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 flex items-center justify-center w-32 h-32">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddClient?.("left")}
                className="flex flex-col items-center space-y-2 text-slate-400 hover:text-slate-600"
                data-testid="button-add-left"
              >
                <Plus className="h-6 w-6" />
                <span className="text-xs">Add Left</span>
              </Button>
            </div>
          ) : (
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-4 flex items-center justify-center w-32 h-32">
              <span className="text-slate-400 text-sm">Empty</span>
            </div>
          )}
          <div className="text-xs text-slate-500 mt-2">Left Position</div>
        </div>

        {/* Right Child */}
        <div className="text-center">
          {rightChild ? (
            <div className="bg-white border-2 border-warning rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow" data-testid={`node-right-${rightChild.id}`}>
              <div className={`w-12 h-12 ${getAvatarColor(rightChild.username)} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <span className="text-white font-medium">{getInitials(rightChild.username)}</span>
              </div>
              <div className="font-medium text-slate-900">{rightChild.username}</div>
              <div className="mb-2">
                <PackageBadge package={rightChild.package || "Silver"} size="sm" />
              </div>
              <div className="text-xs text-slate-500">ID: {rightChild.id.slice(0, 8)}</div>
            </div>
          ) : showAddButtons ? (
            <div className="bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 flex items-center justify-center w-32 h-32">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddClient?.("right")}
                className="flex flex-col items-center space-y-2 text-slate-400 hover:text-slate-600"
                data-testid="button-add-right"
              >
                <Plus className="h-6 w-6" />
                <span className="text-xs">Add Right</span>
              </Button>
            </div>
          ) : (
            <div className="bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-4 flex items-center justify-center w-32 h-32">
              <span className="text-slate-400 text-sm">Empty</span>
            </div>
          )}
          <div className="text-xs text-slate-500 mt-2">Right Position</div>
        </div>
      </div>
    </div>
  );
}
