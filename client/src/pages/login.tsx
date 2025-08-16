import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoginRequest, loginSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { setAuthUser } from "@/lib/auth";
import { useAuthStore } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Network } from "lucide-react";
import logoPath from "@assets/logo_1755178929997.png";

export default function LoginPage() {
  const [role, setRole] = useState<"admin" | "client">("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setUser, setInitialized } = useAuthStore();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "admin",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (user) => {
      setAuthUser(user);
      setUser(user);
      setInitialized(true);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Welcome!",
        description: `Successfully logged in as ${user.role}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate({ ...data, role });
  };

  const handleRoleChange = (newRole: "admin" | "client") => {
    setRole(newRole);
    form.setValue("role", newRole);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6">
            <img 
              src={logoPath} 
              alt="Napping Hand Academy" 
              className="h-20 w-20 mx-auto rounded-full shadow-lg"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900">Sign In</CardTitle>
          <CardDescription>Access your Napping Hand Academy management dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Role Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-100 p-1 rounded-lg flex">
              <Button
                type="button"
                variant={role === "client" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleRoleChange("client")}
                className={role === "client" ? "bg-primary text-white" : "text-slate-600"}
                data-testid="button-client-toggle"
              >
                Client Login
              </Button>
              <Button
                type="button"
                variant={role === "admin" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleRoleChange("admin")}
                className={role === "admin" ? "bg-primary text-white" : "text-slate-600"}
                data-testid="button-admin-toggle"
              >
                Admin Login
              </Button>
            </div>
          </div>

          {/* Admin Credentials Helper */}
          {role === "admin" && (
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                <strong>Default Admin Credentials:</strong>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                Username: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">admin</code><br />
                Password: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">admin123</code>
              </p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        {...field}
                        data-testid="input-username"
                      />
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
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                        data-testid="input-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In as {role === "admin" ? "Admin" : "Client"}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
