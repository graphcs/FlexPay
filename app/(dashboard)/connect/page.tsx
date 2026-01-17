import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PayPalCredentialsForm } from "@/components/dashboard/paypal-credentials-form";
import { CheckCircle2, AlertCircle, CreditCard, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function ConnectPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      paypalConnected: true,
      paypalEmail: true,
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Connect PayPal</h1>
        <p className="text-muted-foreground">
          Link your PayPal Business account to start sending payments
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>PayPal Business Account</CardTitle>
                <CardDescription>
                  {user?.paypalConnected
                    ? "Your PayPal account is connected"
                    : "Enter your PayPal API credentials"}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={user?.paypalConnected ? "success" : "secondary"}
              className="h-7"
            >
              {user?.paypalConnected ? (
                <span className="flex items-center">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Not Connected
                </span>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {user?.paypalConnected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Account Connected
                  </span>
                </div>
                <p className="mt-2 text-sm text-green-700">
                  PayPal Email: <strong>{user.paypalEmail}</strong>
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                You can now create payment schedules and send payments to your
                recipients through PayPal.
              </p>
              <PayPalCredentialsForm isConnected={true} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">How to get your API credentials:</h4>
                <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                  <li>Go to <Link href="https://developer.paypal.com/dashboard/applications/sandbox" target="_blank" className="underline inline-flex items-center">PayPal Developer Dashboard <ExternalLink className="h-3 w-3 ml-1" /></Link></li>
                  <li>Log in with your PayPal Business account</li>
                  <li>Click &quot;Create App&quot; (or select existing app)</li>
                  <li>Copy your <strong>Client ID</strong> and <strong>Secret</strong></li>
                  <li>For production, switch to &quot;Live&quot; credentials</li>
                </ol>
              </div>

              <PayPalCredentialsForm isConnected={false} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Enter your PayPal API credentials</h4>
                <p className="text-sm text-muted-foreground">
                  Get your Client ID and Secret from the PayPal Developer Dashboard.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Add recipients</h4>
                <p className="text-sm text-muted-foreground">
                  Add the people you want to pay with their PayPal email addresses.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Create payment schedules</h4>
                <p className="text-sm text-muted-foreground">
                  Set up recurring payments with flexible schedules - weekly, monthly, or custom.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">
                4
              </div>
              <div>
                <h4 className="font-medium">Payments are sent automatically</h4>
                <p className="text-sm text-muted-foreground">
                  FlexPay will automatically process payments according to your schedule using PayPal Payouts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
