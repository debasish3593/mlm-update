import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { CreateClientRequest, PaymentConfirmationRequest, planPricing } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSidebar } from "@/components/admin-sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QrCode, CreditCard, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Payment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientData, setClientData] = useState<CreateClientRequest | null>(null);
  const [paymentStep, setPaymentStep] = useState<'payment' | 'processing' | 'success'>('payment');

  useEffect(() => {
    // Retrieve client data from sessionStorage
    const pendingData = sessionStorage.getItem('pendingClientData');
    if (!pendingData) {
      toast({
        title: "No client data found",
        description: "Please fill the client form first.",
        variant: "destructive"
      });
      setLocation('/admin/add-client');
      return;
    }

    try {
      const data = JSON.parse(pendingData) as CreateClientRequest;
      setClientData(data);
    } catch (error) {
      console.error('Error parsing client data:', error);
      setLocation('/admin/add-client');
    }
  }, [setLocation, toast]);

  const createClientMutation = useMutation({
    mutationFn: async (paymentData: PaymentConfirmationRequest) => {
      return await apiRequest('POST', '/api/clients/create-with-payment', paymentData);
    },
    onSuccess: () => {
      setPaymentStep('success');
      // Clear the pending client data
      sessionStorage.removeItem('pendingClientData');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      toast({
        title: "Client created successfully!",
        description: "The new client has been added to the system.",
      });

      // Redirect to manage users after 3 seconds
      setTimeout(() => {
        setLocation('/admin/users');
      }, 3000);
    },
    onError: (error: any) => {
      console.error('Client creation error:', error);
      toast({
        title: "Failed to create client",
        description: error?.message || "Please try again.",
        variant: "destructive"
      });
      setPaymentStep('payment');
    }
  });

  const handlePaymentConfirmation = () => {
    if (!clientData) return;

    setPaymentStep('processing');
    
    const paymentData: PaymentConfirmationRequest = {
      clientData,
      paymentConfirmed: true
    };

    createClientMutation.mutate(paymentData);
  };

  if (!clientData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const planAmount = planPricing[clientData.package];
  
  // Map plan names to QR code images
  const getQRCodeImage = (packageName: string) => {
    const qrCodeMap: Record<string, string> = {
      Silver: "/images/510.png",
      Gold: "/images/1010.png", 
      Diamond: "/images/1510.png"
    };
    return qrCodeMap[packageName] || "/images/510.png";
  };
  
  const qrCodeSrc = getQRCodeImage(clientData.package);

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        
        <div className="lg:ml-64 transition-all duration-300">
          <div className="flex items-center justify-center min-h-screen p-6">
            <Card className="max-w-md mx-auto text-center">
              <CardContent className="pt-6">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Client Created Successfully!
                </h2>
                <p className="text-muted-foreground mb-4">
                  {clientData.name} has been added to the system with {clientData.package} plan.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Redirecting to Manage Users...
                </p>
                <Button 
                  onClick={() => setLocation('/admin/users')}
                  className="w-full"
                  data-testid="button-view-users"
                >
                  View All Users
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === 'processing') {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        
        <div className="lg:ml-64 transition-all duration-300">
          <div className="flex items-center justify-center min-h-screen p-6">
            <Card className="max-w-md mx-auto text-center">
              <CardContent className="pt-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Processing Payment...
                </h2>
                <p className="text-muted-foreground">
                  Creating client account and updating system.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
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
                <Link href="/admin/add-client" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">
                  Payment Confirmation
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Client Details Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Client Details Summary
                </CardTitle>
                <CardDescription>
                  Review the information before confirming payment
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-foreground font-medium">{clientData.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                    <p className="text-foreground font-medium">{clientData.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground font-medium">{clientData.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                    <p className="text-foreground font-medium">{clientData.mobile}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground">Selected Plan</label>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-lg font-bold text-foreground">{clientData.package} Plan</span>
                    <span className="text-2xl font-bold text-primary">₹{planAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CreditCard className="h-6 w-6 text-primary mr-2" />
                  Payment Gateway
                </CardTitle>
                <CardDescription>
                  Scan QR code or confirm payment completion
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6 text-center">
                {/* QR Code Section */}
                <div className="bg-muted/50 rounded-lg p-8">
                  <div className="mx-auto w-48 h-48 bg-white dark:bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30 overflow-hidden">
                    <img 
                      src={qrCodeSrc} 
                      alt={`QR Code for ${clientData.package} plan payment`}
                      className="w-full h-full object-cover"
                      data-testid={`img-qr-code-${clientData.package.toLowerCase()}`}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.setAttribute('style', 'display: flex');
                      }}
                    />
                    <div className="w-full h-full items-center justify-center hidden">
                      <QrCode className="h-16 w-16 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4" data-testid="text-qr-description">
                    QR Code for ₹{planAmount} payment ({clientData.package} Plan)
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Scan with any UPI app to make payment
                  </p>
                </div>

                {/* Payment Amount */}
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Amount to Pay</p>
                  <p className="text-3xl font-bold text-primary">₹{planAmount}</p>
                  <p className="text-sm text-muted-foreground">{clientData.package} Plan</p>
                </div>

                {/* Payment Instructions */}
                <div className="text-left space-y-2">
                  <h4 className="font-medium text-foreground">Payment Instructions:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Scan the QR code with any UPI app</li>
                    <li>• Complete the payment of ₹{planAmount}</li>
                    <li>• Click "Payment Done" after successful payment</li>
                    <li>• Wait for confirmation and account creation</li>
                  </ul>
                </div>

                {/* Payment Confirmation Button */}
                <Button 
                  onClick={handlePaymentConfirmation}
                  className="w-full h-12 text-lg"
                  disabled={createClientMutation.isPending}
                  data-testid="button-confirm-payment"
                >
                  {createClientMutation.isPending ? (
                    <>
                      <Clock className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Payment Done - Create Account
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground">
                  Click only after completing the payment successfully
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}