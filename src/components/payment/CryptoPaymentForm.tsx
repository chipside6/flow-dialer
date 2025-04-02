
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Copy, CheckCircle2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CryptoPaymentFormProps {
  planPrice: number;
  planName: string;
  onPaymentComplete: (details: any) => void;
}

export const CryptoPaymentForm = ({ planPrice, planName, onPaymentComplete }: CryptoPaymentFormProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [isWalletInfoOpen, setIsWalletInfoOpen] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const [verificationCount, setVerificationCount] = useState(0);
  const { toast } = useToast();

  // Example crypto addresses - these would be replaced with your actual wallet addresses
  const cryptoAddresses = {
    btc: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    eth: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    usdt: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", // USDT on Ethereum
  };

  // Wallet owner information
  const walletOwner = {
    name: "Company Name, Inc.",
    email: "payments@example.com",
    supportEmail: "support@example.com"
  };

  // Automatically start verification checks when a transaction hash is entered
  React.useEffect(() => {
    // Only start auto-verification if we have a transaction hash with at least 10 characters
    if (txHash.length >= 10 && !autoVerifying && !isVerifying) {
      setAutoVerifying(true);
      autoVerifyTransaction();
    }
  }, [txHash]);

  const handleCopy = (address: string, type: string) => {
    navigator.clipboard.writeText(address);
    setCopied(type);
    
    toast({
      title: "Address copied",
      description: `${type.toUpperCase()} payment address copied to clipboard`,
    });
    
    setTimeout(() => setCopied(null), 3000);
  };

  // Function to automatically verify transactions
  const autoVerifyTransaction = async () => {
    if (!txHash.trim() || isVerifying) return;
    
    if (verificationCount >= 5) {
      // Stop trying after 5 attempts
      setAutoVerifying(false);
      toast({
        title: "Verification stopped",
        description: "We couldn't verify your transaction after multiple attempts. Please verify manually or contact support.",
        variant: "destructive"
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // In a real implementation, you would check this transaction on the blockchain
      // For demo purposes, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate a successful verification with a 80% chance
      const isSuccessful = Math.random() < 0.8;
      
      if (isSuccessful) {
        // Successful payment simulation
        toast({
          title: "Payment verified",
          description: "Your cryptocurrency payment has been verified. Your account will be upgraded shortly.",
        });
        
        onPaymentComplete({
          planName,
          amount: planPrice,
          txHash,
          currency: "USDT",
          timestamp: new Date().toISOString(),
        });
        
        setAutoVerifying(false);
      } else {
        // Transaction not found yet or error
        console.log("Transaction not found in verification attempt", verificationCount + 1);
        
        // Increment count and try again if not reached the maximum
        setVerificationCount(prev => prev + 1);
        
        // Wait longer between each attempt
        setTimeout(() => {
          setIsVerifying(false);
          if (autoVerifying) {
            autoVerifyTransaction();
          }
        }, 5000); // 5 seconds between retries
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      
      // Increment count and try again if not reached the maximum
      setVerificationCount(prev => prev + 1);
      
      toast({
        title: "Verification attempt failed",
        description: "We're still checking your transaction. Please wait...",
        variant: "default"
      });
      
      // Wait longer between each attempt
      setTimeout(() => {
        setIsVerifying(false);
        if (autoVerifying) {
          autoVerifyTransaction();
        }
      }, 5000); // 5 seconds between retries
    }
  };

  const handleVerifyPayment = async () => {
    if (!txHash.trim()) {
      toast({
        title: "Transaction hash required",
        description: "Please enter the transaction hash to verify your payment",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setAutoVerifying(false); // Stop auto-verification if manual verify is clicked
    
    try {
      // In a real implementation, you would check this transaction on the blockchain
      // For demo purposes, we'll simulate verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Successful payment simulation
      toast({
        title: "Payment verified",
        description: "Your cryptocurrency payment has been verified. Your account will be upgraded shortly.",
      });
      
      onPaymentComplete({
        planName,
        amount: planPrice,
        txHash,
        currency: "USDT",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification failed",
        description: "We couldn't verify your transaction. Please check the transaction hash and try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancelAutoVerification = () => {
    setAutoVerifying(false);
    setIsVerifying(false);
    toast({
      title: "Auto-verification cancelled",
      description: "You can still verify your payment manually when ready.",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Pay with Cryptocurrency</CardTitle>
        <CardDescription>
          One-time payment of ${planPrice} for lifetime access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="usdt" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="btc">Bitcoin</TabsTrigger>
            <TabsTrigger value="eth">Ethereum</TabsTrigger>
            <TabsTrigger value="usdt">USDT</TabsTrigger>
          </TabsList>
          
          {Object.entries(cryptoAddresses).map(([currency, address]) => (
            <TabsContent key={currency} value={currency} className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="mb-2 text-sm font-medium">Send {currency.toUpperCase()} to this address:</p>
                <div className="flex items-center">
                  <Input 
                    value={address} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-2" 
                    onClick={() => handleCopy(address, currency)}
                  >
                    {copied === currency ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg border border-dashed border-muted-foreground/50 p-6 text-center">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Send exactly <span className="font-bold">${planPrice}</span> worth of {currency.toUpperCase()}
                  </p>
                </div>
                {currency === 'btc' && (
                  <div className="p-4 bg-gray-100 inline-block rounded-lg">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bitcoin:bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" 
                      alt="BTC QR Code" 
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                )}
                {currency === 'eth' && (
                  <div className="p-4 bg-gray-100 inline-block rounded-lg">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F" 
                      alt="ETH QR Code" 
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                )}
                {currency === 'usdt' && (
                  <div className="p-4 bg-gray-100 inline-block rounded-lg">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F" 
                      alt="USDT QR Code" 
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        <Collapsible 
          open={isWalletInfoOpen} 
          onOpenChange={setIsWalletInfoOpen}
          className="border rounded-lg p-4"
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between">
              <span>Wallet Information</span>
              <ArrowRight className={`h-4 w-4 transition-transform duration-200 ${isWalletInfoOpen ? 'rotate-90' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-3">
            <div>
              <p className="text-sm font-medium">Wallet Owner: {walletOwner.name}</p>
              <p className="text-sm text-muted-foreground">Contact: {walletOwner.email}</p>
              <p className="text-sm mt-2">
                After sending your payment, we will verify the transaction and activate your account.
                If you have any issues, please contact us at {walletOwner.supportEmail}.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="txHash">Transaction Hash</Label>
          <Input
            id="txHash"
            placeholder="Enter your transaction hash/ID"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            After sending payment, enter the transaction hash/ID to verify your payment
          </p>
          
          {autoVerifying && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <p className="text-sm text-blue-700">
                  Auto-verifying your transaction... Attempt {verificationCount + 1}/5
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 h-7 text-xs" 
                onClick={handleCancelAutoVerification}
              >
                Cancel auto-verification
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleVerifyPayment}
          disabled={isVerifying || !txHash.trim()}
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying Payment...
            </>
          ) : (
            "Verify Payment"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
