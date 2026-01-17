"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  MoreHorizontal,
  Pause,
  Play,
  Trash2,
  Loader2,
} from "lucide-react";
import type { Schedule, ScheduleRecipient, Recipient } from "@prisma/client";

interface ScheduleActionsProps {
  schedule: Schedule & {
    recipients: (ScheduleRecipient & { recipient: Recipient })[];
  };
}

export function ScheduleActions({ schedule }: ScheduleActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleStatusChange(newStatus: "active" | "paused") {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update schedule");
      }

      toast({
        title: "Success",
        description: `Schedule ${newStatus === "active" ? "resumed" : "paused"} successfully`,
        variant: "success",
      });

      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update schedule status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/schedules/${schedule.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }

      toast({
        title: "Success",
        description: "Schedule deleted successfully",
        variant: "success",
      });

      setDeleteOpen(false);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const canResume = schedule.status === "paused";
  const canPause = schedule.status === "active";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canPause && (
            <DropdownMenuItem onClick={() => handleStatusChange("paused")}>
              <Pause className="mr-2 h-4 w-4" />
              Pause Schedule
            </DropdownMenuItem>
          )}
          {canResume && (
            <DropdownMenuItem onClick={() => handleStatusChange("active")}>
              <Play className="mr-2 h-4 w-4" />
              Resume Schedule
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{schedule.name}&quot;? This will also
              delete all associated transaction history. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
