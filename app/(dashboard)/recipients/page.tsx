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
import { Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { AddRecipientDialog } from "@/components/dashboard/add-recipient-dialog";
import { RecipientActions } from "@/components/dashboard/recipient-actions";

export default async function RecipientsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const recipients = await db.recipient.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recipients</h1>
          <p className="text-muted-foreground">
            Manage the people you send payments to
          </p>
        </div>
        <AddRecipientDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Recipients</CardTitle>
          <CardDescription>
            {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}{" "}
            total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recipients.length > 0 ? (
            <div className="divide-y">
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                      {recipient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{recipient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {recipient.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {recipient.defaultAmount && (
                      <span className="text-sm text-muted-foreground">
                        Default: {formatCurrency(Number(recipient.defaultAmount))}
                      </span>
                    )}
                    <Badge
                      variant={
                        recipient.status === "active" ? "success" : "secondary"
                      }
                    >
                      {recipient.status}
                    </Badge>
                    <RecipientActions recipient={recipient} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No recipients yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first recipient to start creating payment schedules
              </p>
              <AddRecipientDialog />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
