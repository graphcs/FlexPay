import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        paypalConnected: false,
        paypalEmail: null,
        paypalClientId: null,
        paypalClientSecret: null,
        paypalMode: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PayPal disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect PayPal" },
      { status: 500 }
    );
  }
}
