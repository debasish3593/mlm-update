import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Send, 
  Medal, 
  Users, 
  UserPlus,
  FileText, 
  Building2, 
  Ticket, 
  Clipboard, 
  Settings, 
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  GitBranch,
  BarChart3,
  TrendingUp,
  Share2,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import logoPath from "@assets/logo_1755178929997.png";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <Home className="h-5 w-5" />,
    href: "/admin"
  },
  {
    id: "plans",
    label: "Plans",
    icon: <Send className="h-5 w-5" />,
    href: "/admin/plans"
  },
  {
    id: "ranking",
    label: "User Ranking",
    icon: <Medal className="h-5 w-5" />,
    href: "/admin/ranking"
  },
  {
    id: "add-client",
    label: "Add New Client",
    icon: <UserPlus className="h-5 w-5" />,
    href: "/admin/add-client"
  },
  {
    id: "users",
    label: "Manage Users",
    icon: <Users className="h-5 w-5" />,
    subItems: [
      { id: "all-users", label: "All Users", icon: <Users className="h-4 w-4" />, href: "/admin/users" },
      { id: "binary-tree", label: "Binary Tree", icon: <GitBranch className="h-4 w-4" />, href: "/admin/users/binary-tree" },
      { id: "reports", label: "Reports", icon: <BarChart3 className="h-4 w-4" />, href: "/admin/users/reports" },
      { id: "overview", label: "Overview", icon: <TrendingUp className="h-4 w-4" />, href: "/admin/users/overview" },
      { id: "referrals", label: "Referrals", icon: <Share2 className="h-4 w-4" />, href: "/admin/users/referrals" },
      { id: "earnings", label: "Earnings", icon: <DollarSign className="h-4 w-4" />, href: "/admin/users/earnings" }
    ]
  },
  {
    id: "deposits",
    label: "Deposits",
    icon: <FileText className="h-5 w-5" />,
    subItems: [
      { id: "all-deposits", label: "All Deposits", icon: <FileText className="h-4 w-4" />, href: "/admin/deposits" },
      { id: "pending-deposits", label: "Pending", icon: <FileText className="h-4 w-4" />, href: "/admin/deposits/pending" },
      { id: "approved-deposits", label: "Approved", icon: <FileText className="h-4 w-4" />, href: "/admin/deposits/approved" }
    ]
  },
  {
    id: "withdrawals",
    label: "Withdrawals",
    icon: <Building2 className="h-5 w-5" />,
    subItems: [
      { id: "all-withdrawals", label: "All Withdrawals", icon: <Building2 className="h-4 w-4" />, href: "/admin/withdrawals" },
      { id: "pending-withdrawals", label: "Pending", icon: <Building2 className="h-4 w-4" />, href: "/admin/withdrawals/pending" },
      { id: "approved-withdrawals", label: "Approved", icon: <Building2 className="h-4 w-4" />, href: "/admin/withdrawals/approved" }
    ]
  },
  {
    id: "support",
    label: "Support Ticket",
    icon: <Ticket className="h-5 w-5" />,
    subItems: [
      { id: "all-tickets", label: "All Tickets", icon: <Ticket className="h-4 w-4" />, href: "/admin/support" },
      { id: "open-tickets", label: "Open Tickets", icon: <Ticket className="h-4 w-4" />, href: "/admin/support/open" },
      { id: "closed-tickets", label: "Closed Tickets", icon: <Ticket className="h-4 w-4" />, href: "/admin/support/closed" }
    ]
  },
  {
    id: "reports",
    label: "Report",
    icon: <Clipboard className="h-5 w-5" />,
    subItems: [
      { id: "financial-reports", label: "Financial Reports", icon: <Clipboard className="h-4 w-4" />, href: "/admin/reports/financial" },
      { id: "user-reports", label: "User Reports", icon: <Clipboard className="h-4 w-4" />, href: "/admin/reports/users" },
      { id: "activity-reports", label: "Activity Reports", icon: <Clipboard className="h-4 w-4" />, href: "/admin/reports/activity" }
    ]
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    href: "/admin/settings"
  }
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className = "" }: AdminSidebarProps) {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location === "/admin" || location === "/";
    }
    return location.startsWith(href);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const active = item.href ? isActive(item.href) : false;

    return (
      <div key={item.id} className={level > 0 ? "ml-4" : ""}>
        {item.href ? (
          <Link href={item.href}>
            <div
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                ${active 
                  ? "bg-violet-600 text-white shadow-lg" 
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }
                ${isCollapsed ? "justify-center px-2" : ""}
              `}
              data-testid={`sidebar-${item.id}`}
            >
              <div className="flex items-center space-x-3">
                <span className={`${active ? "text-white" : ""}`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </div>
              {!isCollapsed && hasSubItems && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleExpanded(item.id);
                  }}
                  className="p-1"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </Link>
        ) : (
          <div
            className={`
              flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
              text-slate-300 hover:bg-slate-700 hover:text-white
              ${isCollapsed ? "justify-center px-2" : ""}
            `}
            onClick={() => toggleExpanded(item.id)}
            data-testid={`sidebar-${item.id}`}
          >
            <div className="flex items-center space-x-3">
              <span>{item.icon}</span>
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </div>
            {!isCollapsed && hasSubItems && (
              <span className="p-1">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            )}
          </div>
        )}
        
        {/* Sub-items */}
        {!isCollapsed && hasSubItems && isExpanded && (
          <div className="mt-2 space-y-1">
            {item.subItems!.map((subItem) => renderMenuItem(subItem, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-slate-800 text-white hover:bg-slate-700"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        data-testid="mobile-menu-button"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen bg-slate-800 border-r border-slate-700 z-50 transition-all duration-300 flex flex-col
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${className}
        `}
        data-testid="admin-sidebar"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={logoPath}
                alt="Napping Hand Academy"
                className="h-10 w-10 rounded-full shadow-lg"
              />
              {!isCollapsed && (
                <div>
                  <h2 className="text-white font-bold text-lg">Admin Panel</h2>
                  <p className="text-slate-400 text-xs">Napping Hand Academy</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-slate-700 hidden lg:flex"
                onClick={() => setIsCollapsed(true)}
                data-testid="collapse-sidebar"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-700 w-full mt-4 hidden lg:flex"
              onClick={() => setIsCollapsed(false)}
              data-testid="expand-sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto min-h-0">
          <div className="space-y-2">
            {menuItems.map((item) => renderMenuItem(item))}
          </div>
        </nav>

        {/* Footer with theme toggle */}
        {!isCollapsed && (
          <div className="p-4 border-t border-slate-700 flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}