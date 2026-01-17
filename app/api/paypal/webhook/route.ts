import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PayPal webhook event types we handle
type PayPalWebhookEventType =
  | "PAYMENT.PAYOUTSBATCH.SUCCESS"
  | "PAYMENT.PAYOUTSBATCH.DENIED"
  | "PAYMENT.PAYOUTS-ITEM.SUCCEEDED"
  | "PAYMENT.PAYOUTS-ITEM.FAILED"
  | "PAYMENT.PAYOUTS-ITEM.BLOCKED"
  | "PAYMENT.PAYOUTS-ITEM.REFUNDED"
  | "PAYMENT.PAYOUTS-ITEM.RETURNED"
  | "PAYMENT.PAYOUTS-ITEM.UNCLAIMED";

interface PayPalWebhookEvent {
  id: string;
  event_type: PayPalWebhookEventType;
  resource: {
    batch_header?: {
      payout_batch_id: string;
      batch_status: string;
    };
    payout_item_id?: string;
    payout_batch_id?: string;
    transaction_status?: string;
    sender_item_id?: string;
    errors?: {
      message: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const event: PayPalWebhookEvent = JSON.parse(body);

    console.log(`[Webhook] Received event: ${event.event_type}`);

    // In production, you should verify the webhook signature
    // using verifyWebhookSignature from lib/paypal.ts

    switch (event.event_type) {
      case "PAYMENT.PAYOUTSBATCH.SUCCESS": {
        // Batch completed successfully
        const batchId = event.resource.batch_header?.payout_batch_id;
        if (batchId) {
          await db.transaction.updateMany({
            where: { paypalBatchId: batchId },
            data: { status: "completed", completedAt: new Date() },
          });
          console.log(`[Webhook] Batch ${batchId} marked as completed`);
        }
        break;
      }

      case "PAYMENT.PAYOUTSBATCH.DENIED": {
        // Batch was denied
        const batchId = event.resource.batch_header?.payout_batch_id;
        if (batchId) {
          await db.transaction.updateMany({
            where: { paypalBatchId: batchId },
            data: {
              status: "failed",
              errorMessage: "Payout batch was denied by PayPal",
            },
          });
          console.log(`[Webhook] Batch ${batchId} marked as failed (denied)`);
        }
        break;
      }

      case "PAYMENT.PAYOUTS-ITEM.SUCCEEDED": {
        // Individual payout item succeeded
        const itemId = event.resource.sender_item_id;
        if (itemId) {
          await db.transaction.update({
            where: { id: itemId },
            data: {
              status: "completed",
              paypalItemId: event.resource.payout_item_id,
              completedAt: new Date(),
            },
          });
          console.log(`[Webhook] Transaction ${itemId} marked as completed`);
        }
        break;
      }

      case "PAYMENT.PAYOUTS-ITEM.FAILED":
      case "PAYMENT.PAYOUTS-ITEM.BLOCKED":
      case "PAYMENT.PAYOUTS-ITEM.RETURNED": {
        // Individual payout item failed
        const itemId = event.resource.sender_item_id;
        if (itemId) {
          await db.transaction.update({
            where: { id: itemId },
            data: {
              status: "failed",
              paypalItemId: event.resource.payout_item_id,
              errorMessage:
                event.resource.errors?.message ||
                `Payout ${event.event_type.split(".").pop()?.toLowerCase()}`,
            },
          });
          console.log(`[Webhook] Transaction ${itemId} marked as failed`);
        }
        break;
      }

      case "PAYMENT.PAYOUTS-ITEM.UNCLAIMED": {
        // Recipient hasn't claimed the payment
        const itemId = event.resource.sender_item_id;
        if (itemId) {
          await db.transaction.update({
            where: { id: itemId },
            data: {
              status: "pending",
              paypalItemId: event.resource.payout_item_id,
              errorMessage: "Payment unclaimed by recipient",
            },
          });
          console.log(`[Webhook] Transaction ${itemId} marked as unclaimed`);
        }
        break;
      }

      case "PAYMENT.PAYOUTS-ITEM.REFUNDED": {
        // Payment was refunded
        const itemId = event.resource.sender_item_id;
        if (itemId) {
          await db.transaction.update({
            where: { id: itemId },
            data: {
              status: "failed",
              paypalItemId: event.resource.payout_item_id,
              errorMessage: "Payment was refunded",
            },
          });
          console.log(`[Webhook] Transaction ${itemId} marked as refunded`);
        }
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
