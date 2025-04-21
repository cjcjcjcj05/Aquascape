import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function VerifyEmailPage() {
  const [location, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // Extract token from URL
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get("token");
    
    if (tokenParam) {
      setToken(tokenParam);
      
      // Verify the token
      fetch(`/api/verify-email/${tokenParam}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Verification failed');
          }
          return response.json();
        })
        .then(() => {
          setVerificationStatus('success');
        })
        .catch(() => {
          setVerificationStatus('error');
        });
    } else {
      setVerificationStatus('error');
    }
  }, []);

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">Verifying your email address...</p>
          </div>
        );
      
      case 'success':
        return (
          <Alert className="mb-6">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <AlertTitle>Email verified!</AlertTitle>
            <AlertDescription>
              Your email address has been successfully verified. You can now access all features of your account.
            </AlertDescription>
          </Alert>
        );
      
      case 'error':
        return (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-5 w-5" />
            <AlertTitle>Verification failed</AlertTitle>
            <AlertDescription>
              The verification link is invalid or has expired. Please request a new verification email from your profile settings.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            Verify your email address to access all features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
          
          <div className="flex flex-col space-y-4">
            <Button 
              onClick={() => setLocation("/")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setLocation("/profile")}
              className="w-full"
            >
              Go to Profile Settings
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact <a href="mailto:support@aquascape.com" className="text-primary hover:underline">support</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}