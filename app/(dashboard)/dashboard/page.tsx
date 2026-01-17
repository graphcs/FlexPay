import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Receipt,
} from "lucide-react";
import { formatCurrency, formatDate, getFrequencyLabel } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      recipients: {
        where: { status: "active" },
      },
      schedules: {
        where: { status: "active" },
        include: {
          recipients: {
            include: { recipient: true },
          },
        },
        orderBy: { nextRunDate: "asc" },
        take: 5,
      },
    },
  });

  const recentTransactions = await db.transaction.findMany({
    where: {
      schedule: {
        userId: session.user.id,
      },
    },
    include: {
      recipient: true,
      schedule: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalPaidResult = await db.transaction.aggregate({
    where: {
      schedule: { userId: session.user.id },
      status: "completed",
    },
    _sum: { amount: true },
  });

  const totalPaid = totalPaidResult._sum.amount
    ? Number(totalPaidResult._sum.amount)
    : 0;

  const stats = {
    totalPaid,
    recipientCount: user?.recipients.length || 0,
    activeSchedules: user?.schedules.length || 0,
    paypalConnected: user?.paypalConnected || false,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name}
        </p>
      </div>

      {!stats.paypalConnected && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg text-yellow-800">
                Connect Your PayPal Account
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-4">
              To start sending payments, you need to connect your PayPal
              Business account.
            </p>
            <Link href="/connect">
              <Button>
                <CreditCard className="mr-2 h-4 w-4" />
                Connect PayPal
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recipientCount}</div>
            <p className="text-xs text-muted-foreground">Active recipients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Schedules
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSchedules}</div>
            <p className="text-xs text-muted-foreground">Running schedules</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>
                  Your scheduled payments for the coming days
                </CardDescription>
              </div>
              <Link href="/schedules">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {user?.schedules && user.schedules.length > 0 ? (
              <div className="space-y-4">
                {user.schedules.map((schedule) => {
                  const totalAmount = schedule.recipients.reduce(
                    (sum, r) => sum + Number(r.amount),
                    0
                  );
                  return (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{schedule.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.recipients.length} recipient
                          {schedule.recipients.length !== 1 ? "s" : ""} -{" "}
                          {getFrequencyLabel(schedule.frequency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(totalAmount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.nextRunDate
                            ? formatDate(schedule.nextRunDate)
                            : "Not scheduled"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No active schedules yet
                </p>
                <Link href="/schedules/new">
                  <Button>Create Schedule</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest payment activity</CardDescription>
              </div>
              <Link href="/transactions">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{tx.recipient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.recipient.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(Number(tx.amount))}
                      </p>
                      <Badge
                        variant={
                          tx.status === "completed"
                            ? "success"
                            : tx.status === "failed"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
