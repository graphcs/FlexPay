import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const connectSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  mode: z.enum(["sandbox", "live"]),
  paypalEmail: z.string().email("Invalid email"),
});

// Verify credentials by getting an access token
async function verifyPayPalCredentials(
  clientId: string,
  clientSecret: string,
  mode: string
): Promise<boolean> {
  const baseUrl = mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: "grant_type=client_credentials",
    });

    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = connectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { clientId, clientSecret, mode, paypalEmail } = parsed.data;

    // Verify the credentials work
    const isValid = await verifyPayPalCredentials(clientId, clientSecret, mode);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid PayPal credentials. Please check your Client ID and Secret." },
        { status: 400 }
      );
    }

    // Save credentials to user
    await db.user.update({
      where: { id: session.user.id },
      data: {
        paypalConnected: true,
        paypalEmail,
        paypalClientId: clientId,
        paypalClientSecret: clientSecret,
        paypalMode: mode,
      },
    });

    return NextResponse.json({ success: true, message: "PayPal connected successfully" });
  } catch (error) {
    console.error("PayPal connect error:", error);
    return NextResponse.json(
      { error: "Failed to connect PayPal" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
