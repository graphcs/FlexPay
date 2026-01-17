import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = "USD"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function calculateNextRunDate(
  frequency: string,
  startDate: Date,
  customDays?: number
): Date {
  const now = new Date();
  let nextRun = new Date(startDate);

  // If start date is in the future, use it
  if (nextRun > now) {
    return nextRun;
  }

  // Calculate next run based on frequency
  switch (frequency) {
    case "one_time":
      return nextRun;
    case "weekly":
      while (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 7);
      }
      break;
    case "bi_weekly":
      while (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 14);
      }
      break;
    case "monthly":
      while (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
      break;
    case "custom":
      if (customDays) {
        while (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + customDays);
        }
      }
      break;
  }

  return nextRun;
}

export function getFrequencyLabel(frequency: string, customDays?: number): string {
  switch (frequency) {
    case "one_time":
      return "One-time";
    case "weekly":
      return "Weekly";
    case "bi_weekly":
      return "Bi-weekly";
    case "monthly":
      return "Monthly";
    case "custom":
      return customDays ? `Every ${customDays} days` : "Custom";
    default:
      return frequency;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
    case "completed":
    case "success":
      return "bg-green-100 text-green-800";
    case "pending":
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "paused":
      return "bg-gray-100 text-gray-800";
    case "failed":
    case "cancelled":
    case "error":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
