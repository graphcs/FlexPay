import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus } from "lucide-react";
import { formatCurrency, formatDate, getFrequencyLabel } from "@/lib/utils";
import { ScheduleActions } from "@/components/dashboard/schedule-actions";

export default async function SchedulesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const schedules = await db.schedule.findMany({
    where: { userId: session.user.id },
    include: {
      recipients: {
        include: { recipient: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Schedules</h1>
          <p className="text-muted-foreground">
            Manage your recurring payment schedules
          </p>
        </div>
        <Link href="/schedules/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Schedules</CardTitle>
          <CardDescription>
            {schedules.length} schedule{schedules.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {schedules.length > 0 ? (
            <div className="divide-y">
              {schedules.map((schedule) => {
                const totalAmount = schedule.recipients.reduce(
                  (sum, r) => sum + Number(r.amount),
                  0
                );
                return (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{schedule.name}</p>
                        <Badge
                          variant={
                            schedule.status === "active"
                              ? "success"
                              : schedule.status === "paused"
                              ? "secondary"
                              : schedule.status === "completed"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {schedule.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {schedule.recipients.length} recipient
                        {schedule.recipients.length !== 1 ? "s" : ""} -{" "}
                        {getFrequencyLabel(
                          schedule.frequency,
                          schedule.customDays ?? undefined
                        )}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Total: {formatCurrency(totalAmount)}</span>
                        {schedule.nextRunDate && schedule.status === "active" && (
                          <span>
                            Next payment: {formatDate(schedule.nextRunDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ScheduleActions schedule={schedule} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No schedules yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first payment schedule to automate payments
              </p>
              <Link href="/schedules/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Schedule
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
