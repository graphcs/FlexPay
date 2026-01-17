"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Eye, EyeOff, Unlink } from "lucide-react";

interface PayPalCredentialsFormProps {
  isConnected: boolean;
}

export function PayPalCredentialsForm({ isConnected }: PayPalCredentialsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [mode, setMode] = useState("sandbox");
  const [paypalEmail, setPaypalEmail] = useState("");

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();

    if (!clientId || !clientSecret || !paypalEmail) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/paypal/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret,
          mode,
          paypalEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect PayPal");
      }

      toast({
        title: "Success",
        description: "PayPal account connected successfully!",
        variant: "success",
      });

      setClientId("");
      setClientSecret("");
      setPaypalEmail("");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect PayPal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDisconnect() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/paypal/disconnect", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect");
      }

      toast({
        title: "Disconnected",
        description: "Your PayPal account has been disconnected.",
      });

      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to disconnect PayPal account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isConnected) {
    return (
      <Button
        variant="outline"
        onClick={handleDisconnect}
        disabled={isLoading}
        className="text-destructive hover:text-destructive"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Unlink className="mr-2 h-4 w-4" />
        )}
        Disconnect PayPal
      </Button>
    );
  }

  return (
    <form onSubmit={handleConnect} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="paypalEmail">PayPal Business Email</Label>
        <Input
          id="paypalEmail"
          type="email"
          placeholder="your-business@example.com"
          value={paypalEmail}
          onChange={(e) => setPaypalEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          The email associated with your PayPal Business account
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="clientId">Client ID</Label>
        <Input
          id="clientId"
          type="text"
          placeholder="Your PayPal Client ID"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="clientSecret">Client Secret</Label>
        <div className="relative">
          <Input
            id="clientSecret"
            type={showSecret ? "text" : "password"}
            placeholder="Your PayPal Client Secret"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            required
            disabled={isLoading}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowSecret(!showSecret)}
          >
            {showSecret ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="mode">Environment</Label>
        <Select value={mode} onValueChange={setMode} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
            <SelectItem value="live">Live (Production)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Use Sandbox for testing, Live for real payments
        </p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Connect PayPal Account
      </Button>
    </form>
  );
}
