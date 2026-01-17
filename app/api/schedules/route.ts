import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { calculateNextRunDate } from "@/lib/utils";

const scheduleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  frequency: z.enum(["one_time", "weekly", "bi_weekly", "monthly", "custom"]),
  customDays: z.number().int().positive().optional(),
  startDate: z.string(),
  recipients: z.array(
    z.object({
      recipientId: z.string(),
      amount: z.number().positive("Amount must be positive"),
      note: z.string().optional(),
    })
  ).min(1, "At least one recipient is required"),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schedules = await db.schedule.findMany({
      where: { userId: session.user.id },
      include: {
        recipients: {
          include: { recipient: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Get schedules error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if PayPal is connected
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { paypalConnected: true },
    });

    if (!user?.paypalConnected) {
      return NextResponse.json(
        { message: "Please connect your PayPal account first" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = scheduleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, frequency, customDays, startDate, recipients } = parsed.data;

    // Validate that all recipients exist and belong to the user
    const recipientIds = recipients.map((r) => r.recipientId);
    const validRecipients = await db.recipient.findMany({
      where: {
        id: { in: recipientIds },
        userId: session.user.id,
      },
    });

    if (validRecipients.length !== recipientIds.length) {
      return NextResponse.json(
        { message: "One or more recipients are invalid" },
        { status: 400 }
      );
    }

    // Calculate next run date
    const startDateObj = new Date(startDate);
    const nextRunDate = calculateNextRunDate(
      frequency,
      startDateObj,
      customDays
    );

    // Create schedule with recipients
    const schedule = await db.schedule.create({
      data: {
        userId: session.user.id,
        name,
        frequency,
        customDays: frequency === "custom" ? customDays : null,
        startDate: startDateObj,
        nextRunDate,
        recipients: {
          create: recipients.map((r) => ({
            recipientId: r.recipientId,
            amount: r.amount,
            note: r.note,
          })),
        },
      },
      include: {
        recipients: {
          include: { recipient: true },
        },
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Create schedule error:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
