import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateRecipientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  defaultAmount: z.number().positive().nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify recipient belongs to user
    const recipient = await db.recipient.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = updateRecipientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const updatedRecipient = await db.recipient.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updatedRecipient);
  } catch (error) {
    console.error("Update recipient error:", error);
    return NextResponse.json(
      { error: "Failed to update recipient" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify recipient belongs to user
    const recipient = await db.recipient.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    await db.recipient.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete recipient error:", error);
    return NextResponse.json(
      { error: "Failed to delete recipient" },
      { status: 500 }
    );
  }
}
