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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Receipt } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const transactions = await db.transaction.findMany({
    where: {
      schedule: { userId: session.user.id },
    },
    include: {
      recipient: true,
      schedule: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => t.status === "completed").length,
    pending: transactions.filter((t) => t.status === "pending" || t.status === "processing").length,
    failed: transactions.filter((t) => t.status === "failed").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">View your payment history</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            A detailed list of all your payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>PayPal ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDateTime(tx.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{tx.recipient.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.recipient.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{tx.schedule.name}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(Number(tx.amount), tx.currency)}
                    </TableCell>
                    <TableCell>
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
                      {tx.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">
                          {tx.errorMessage}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {tx.paypalBatchId || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No transactions yet</h3>
              <p className="text-sm text-muted-foreground">
                Transactions will appear here once your schedules start
                processing payments
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
