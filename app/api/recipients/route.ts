import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const recipientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  defaultAmount: z.number().positive().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipients = await db.recipient.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recipients);
  } catch (error) {
    console.error("Get recipients error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipients" },
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

    const body = await request.json();
    const parsed = recipientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, defaultAmount } = parsed.data;

    // Check if recipient with same email already exists for this user
    const existingRecipient = await db.recipient.findFirst({
      where: {
        userId: session.user.id,
        email,
      },
    });

    if (existingRecipient) {
      return NextResponse.json(
        { message: "A recipient with this email already exists" },
        { status: 400 }
      );
    }

    const recipient = await db.recipient.create({
      data: {
        userId: session.user.id,
        name,
        email,
        defaultAmount,
      },
    });

    return NextResponse.json(recipient, { status: 201 });
  } catch (error) {
    console.error("Create recipient error:", error);
    return NextResponse.json(
      { error: "Failed to create recipient" },
      { status: 500 }
    );
  }
}
