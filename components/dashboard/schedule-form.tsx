"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, X } from "lucide-react";
import type { Recipient } from "@prisma/client";

interface ScheduleFormProps {
  recipients: Recipient[];
}

interface ScheduleRecipient {
  recipientId: string;
  amount: string;
  note: string;
}

export function ScheduleForm({ recipients }: ScheduleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [customDays, setCustomDays] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedRecipients, setSelectedRecipients] = useState<
    ScheduleRecipient[]
  >([]);

  function addRecipient() {
    const availableRecipient = recipients.find(
      (r) => !selectedRecipients.some((sr) => sr.recipientId === r.id)
    );

    if (availableRecipient) {
      setSelectedRecipients([
        ...selectedRecipients,
        {
          recipientId: availableRecipient.id,
          amount: availableRecipient.defaultAmount?.toString() || "",
          note: "",
        },
      ]);
    }
  }

  function removeRecipient(index: number) {
    setSelectedRecipients(selectedRecipients.filter((_, i) => i !== index));
  }

  function updateRecipient(
    index: number,
    field: keyof ScheduleRecipient,
    value: string
  ) {
    const updated = [...selectedRecipients];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedRecipients(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (selectedRecipients.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one recipient",
        variant: "destructive",
      });
      return;
    }

    if (selectedRecipients.some((r) => !r.amount || parseFloat(r.amount) <= 0)) {
      toast({
        title: "Error",
        description: "Please enter a valid amount for all recipients",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          frequency,
          customDays: frequency === "custom" ? parseInt(customDays) : undefined,
          startDate,
          recipients: selectedRecipients.map((r) => ({
            recipientId: r.recipientId,
            amount: parseFloat(r.amount),
            note: r.note || undefined,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create schedule");
      }

      toast({
        title: "Success",
        description: "Schedule created successfully",
        variant: "success",
      });

      router.push("/schedules");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create schedule",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const availableRecipients = recipients.filter(
    (r) => !selectedRecipients.some((sr) => sr.recipientId === r.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
          <CardDescription>Configure the basic schedule settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Schedule Name</Label>
            <Input
              id="name"
              placeholder="e.g., Weekly Contractor Payments"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={frequency}
              onValueChange={setFrequency}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_time">One-time</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === "custom" && (
            <div className="grid gap-2">
              <Label htmlFor="customDays">Repeat every (days)</Label>
              <Input
                id="customDays"
                type="number"
                min="1"
                max="365"
                placeholder="e.g., 10"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recipients</CardTitle>
              <CardDescription>
                Select recipients and set payment amounts
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRecipient}
              disabled={isLoading || availableRecipients.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Recipient
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedRecipients.length > 0 ? (
            <div className="space-y-4">
              {selectedRecipients.map((sr, index) => {
                const recipient = recipients.find(
                  (r) => r.id === sr.recipientId
                );
                return (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-lg border"
                  >
                    <div className="flex-1 space-y-3">
                      <div className="grid gap-2">
                        <Label>Recipient</Label>
                        <Select
                          value={sr.recipientId}
                          onValueChange={(value) =>
                            updateRecipient(index, "recipientId", value)
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {recipient && (
                              <SelectItem value={recipient.id}>
                                {recipient.name} ({recipient.email})
                              </SelectItem>
                            )}
                            {availableRecipients.map((r) => (
                              <SelectItem key={r.id} value={r.id}>
                                {r.name} ({r.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Amount (USD)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="100.00"
                            value={sr.amount}
                            onChange={(e) =>
                              updateRecipient(index, "amount", e.target.value)
                            }
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Note (optional)</Label>
                          <Input
                            placeholder="Payment note..."
                            value={sr.note}
                            onChange={(e) =>
                              updateRecipient(index, "note", e.target.value)
                            }
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRecipient(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recipients added yet. Click &quot;Add Recipient&quot; to add one.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Schedule
        </Button>
      </div>
    </form>
  );
}
