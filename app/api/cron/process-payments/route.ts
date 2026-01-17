import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPayout, PayPalCredentials } from "@/lib/paypal";
import { calculateNextRunDate } from "@/lib/utils";

// Verify the request is from Vercel Cron
function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In production, verify the cron secret
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return false;
  }

  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron request in production
    if (process.env.NODE_ENV === "production" && !verifyCronRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    console.log(`[Cron] Processing payments at ${now.toISOString()}`);

    // Find all due schedules
    const dueSchedules = await db.schedule.findMany({
      where: {
        status: "active",
        nextRunDate: {
          lte: now,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            paypalConnected: true,
            paypalClientId: true,
            paypalClientSecret: true,
            paypalMode: true,
          },
        },
        recipients: {
          include: {
            recipient: true,
          },
        },
      },
    });

    console.log(`[Cron] Found ${dueSchedules.length} due schedules`);

    const results = {
      processed: 0,
      failed: 0,
      skipped: 0,
    };

    for (const schedule of dueSchedules) {
      try {
        // Skip if user doesn't have PayPal connected or missing credentials
        if (
          !schedule.user.paypalConnected ||
          !schedule.user.paypalClientId ||
          !schedule.user.paypalClientSecret ||
          !schedule.user.paypalMode
        ) {
          console.log(`[Cron] Skipping schedule ${schedule.id} - PayPal not connected or credentials missing`);
          results.skipped++;
          continue;
        }

        // Prepare credentials
        const credentials: PayPalCredentials = {
          clientId: schedule.user.paypalClientId,
          clientSecret: schedule.user.paypalClientSecret,
          mode: schedule.user.paypalMode as "sandbox" | "live",
        };

        // Create transaction records
        const batchId = `flexpay-${schedule.id}-${Date.now()}`;
        const transactions = await Promise.all(
          schedule.recipients.map((sr) =>
            db.transaction.create({
              data: {
                scheduleId: schedule.id,
                recipientId: sr.recipientId,
                amount: sr.amount,
                status: "processing",
                paypalBatchId: batchId,
              },
            })
          )
        );

        // Prepare payout items
        const payoutItems = schedule.recipients.map((sr, index) => ({
          email: sr.recipient.email,
          amount: sr.amount.toString(),
          currency: "USD",
          note: sr.note || `Payment from FlexPay - ${schedule.name}`,
          itemId: transactions[index].id,
        }));

        // Create PayPal payout
        try {
          const payoutResponse = await createPayout(
            credentials,
            payoutItems,
            batchId
          );

          console.log(`[Cron] PayPal payout created: ${payoutResponse.batch_header.payout_batch_id}`);

          // Update transactions with PayPal batch ID
          await db.transaction.updateMany({
            where: { paypalBatchId: batchId },
            data: {
              paypalBatchId: payoutResponse.batch_header.payout_batch_id,
              status: "pending",
              processedAt: now,
            },
          });

          results.processed++;
        } catch (error) {
          console.error(`[Cron] PayPal payout failed for schedule ${schedule.id}:`, error);

          // Mark transactions as failed
          await db.transaction.updateMany({
            where: { paypalBatchId: batchId },
            data: {
              status: "failed",
              errorMessage: error instanceof Error ? error.message : "PayPal payout failed",
            },
          });

          results.failed++;
        }

        // Update schedule's next run date
        const nextRunDate = schedule.frequency === "one_time"
          ? null
          : calculateNextRunDate(
              schedule.frequency,
              schedule.nextRunDate || now,
              schedule.customDays ?? undefined
            );

        await db.schedule.update({
          where: { id: schedule.id },
          data: {
            lastRunDate: now,
            nextRunDate,
            status: schedule.frequency === "one_time" ? "completed" : "active",
          },
        });
      } catch (error) {
        console.error(`[Cron] Error processing schedule ${schedule.id}:`, error);
        results.failed++;
      }
    }

    console.log(`[Cron] Completed: ${JSON.stringify(results)}`);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      results,
    });
  } catch (error) {
    console.error("[Cron] Fatal error:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
