import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that works best for your team. All plans include
            core features.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Up to 5 recipients
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  3 active schedules
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Basic reporting
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Email support
                </li>
              </ul>
              <Link href="/register" className="block mt-6">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="border-primary relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            <CardHeader className="pt-8">
              <CardTitle>Pro</CardTitle>
              <CardDescription>For growing teams</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Up to 50 recipients
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Unlimited schedules
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  CSV import/export
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Advanced reporting
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Priority support
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Webhook notifications
                </li>
              </ul>
              <Link href="/register" className="block mt-6">
                <Button className="w-full">Get Started</Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For large organizations</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">Custom</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Unlimited recipients
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Unlimited everything
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Custom integrations
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Dedicated account manager
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  SLA guarantee
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                  Custom contracts
                </li>
              </ul>
              <Link href="#" className="block mt-6">
                <Button variant="outline" className="w-full">
                  Contact Sales
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">
                What payment methods do you support?
              </h3>
              <p className="text-muted-foreground">
                FlexPay integrates directly with PayPal Business accounts. All
                payments are processed through PayPal using their Payouts API.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                Are there any transaction fees?
              </h3>
              <p className="text-muted-foreground">
                FlexPay does not charge transaction fees. Standard PayPal
                Payouts fees apply (typically 2% of the transaction amount,
                capped at $1 per recipient).
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. Your account
                will remain active until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee on all paid plans. If
                you&apos;re not satisfied, contact us for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
