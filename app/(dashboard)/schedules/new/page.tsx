import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ScheduleForm } from "@/components/dashboard/schedule-form";

export default async function NewSchedulePage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { paypalConnected: true },
  });

  if (!user?.paypalConnected) {
    redirect("/connect?error=paypal_required");
  }

  const recipients = await db.recipient.findMany({
    where: { userId: session.user.id, status: "active" },
    orderBy: { name: "asc" },
  });

  if (recipients.length === 0) {
    redirect("/recipients?error=no_recipients");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create Schedule</h1>
        <p className="text-muted-foreground">
          Set up a new recurring payment schedule
        </p>
      </div>

      <ScheduleForm recipients={recipients} />
    </div>
  );
}
