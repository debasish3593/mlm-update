import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { AuthUser, setAuthUser, clearAuth } from "./lib/auth";
import { useAuthStore } from "./hooks/use-auth";
import LoginPage from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import ClientDashboard from "@/pages/client-dashboard";
import AddClient from "@/pages/add-client";
import Payment from "@/pages/payment";
import ManageUsers from "@/pages/manage-users";
import Plans from "@/pages/plans";
import NotFound from "@/pages/not-found";

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isInitialized, setUser, setInitialized } = useAuthStore();
  
  const { data: userData, isLoading, error } = useQuery<AuthUser>({
    queryKey: ['/api/auth/me'],
    retry: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    enabled: !isInitialized, // Only run if not yet initialized
  });

  React.useEffect(() => {
    if (userData) {
      setUser(userData);
      setAuthUser(userData);
      setInitialized(true);
    } else if (error && !isInitialized) {
      clearAuth();
      setUser(null);
      setInitialized(true);
    }
  }, [userData, error, isInitialized, setUser, setInitialized]);

  if (!isInitialized && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return (
    <Switch>
      <Route path="/admin/add-client" component={() => user.role === 'admin' ? <AddClient /> : <NotFound />} />
      <Route path="/admin/payment" component={() => user.role === 'admin' ? <Payment /> : <NotFound />} />
      <Route path="/admin/users" component={() => user.role === 'admin' ? <ManageUsers /> : <NotFound />} />
      <Route path="/admin/users/binary-tree" component={() => user.role === 'admin' ? <ManageUsers /> : <NotFound />} />
      <Route path="/admin/users/reports" component={() => user.role === 'admin' ? <ManageUsers /> : <NotFound />} />
      <Route path="/admin/users/overview" component={() => user.role === 'admin' ? <ManageUsers /> : <NotFound />} />
      <Route path="/admin/users/referrals" component={() => user.role === 'admin' ? <ManageUsers /> : <NotFound />} />
      <Route path="/admin/users/earnings" component={() => user.role === 'admin' ? <ManageUsers /> : <NotFound />} />
      <Route path="/admin/plans" component={() => user.role === 'admin' ? <Plans /> : <NotFound />} />
      <Route path="/admin" component={() => user.role === 'admin' ? <AdminDashboard /> : <NotFound />} />
      <Route path="/client" component={() => user.role === 'client' ? <ClientDashboard /> : <NotFound />} />
      <Route path="/" component={() => user.role === 'admin' ? <AdminDashboard /> : <ClientDashboard />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="napping-hand-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AuthWrapper>
            <Router />
          </AuthWrapper>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
