"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"; // shadcn/ui

type Props = {
  apptId: string;
  status?: string;
  patientName?: string;
  doctorName?: string;
  // Parent-dən gələn handler-lər (optimistik update üçün)
  onMarkArrived?: () => void;
  onMarkCompleted?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onOpenDetails?: () => void;
  onAfterAction?: () => void;
};

export default function AppointmentContextMenu(props: React.PropsWithChildren<Props>) {
  const router = useRouter();
  const {
    apptId,
    status,
    patientName,
    doctorName,
    onMarkArrived,
    onMarkCompleted,
    onCancel,
    onDelete,
    onOpenDetails,
    onAfterAction,
    children,
  } = props;

  // Helper: server PATCH (status dəyişmək üçün)
  async function patchStatus(newStatus: string) {
    try {
      const r = await fetch(`/api/clinic/appointments/${apptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, silent: true }), // email göndərmə
      });
      if (!r.ok) throw new Error(`PATCH failed (${r.status})`);
      onAfterAction?.(); // parent refresh tətikləmək üçün
    } catch (e) {
      console.error("Appointment status update failed:", e);
    }
  }
  // Helper: server DELETE (qısa yoldan silmək üçün)
  async function removeAppt() {
    try {
      const r = await fetch(`/api/clinic/appointments/${apptId}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`DELETE failed (${r.status})`);
    } catch (e) {
      console.error("Appointment delete failed:", e);
    }
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          {patientName ? <div className="font-medium text-foreground">{patientName}</div> : null}
          {doctorName ? <div>{doctorName}</div> : null}
          {status ? <div>Status: {status.replace(/_/g, " ")}</div> : null}
        </div>
        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={async () => {
            // UI-ni parent-də optimistik yenilə
            onMarkArrived?.();
            // Serverdə “in_progress” (və ya sənin istədiyin) kimi qeyd edək
            await patchStatus("in_progress");
          }}
        >
          ✓ Mark as arrived
        </ContextMenuItem>

        <ContextMenuItem
          onClick={async () => {
            onMarkCompleted?.();
            await patchStatus("completed");
          }}
        >
          ✔ Mark as completed
        </ContextMenuItem>

        <ContextMenuItem
          onClick={async () => {
            onCancel?.();
            await patchStatus("cancelled");
          }}
        >
          ✖ Cancel
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={() => {
            onOpenDetails?.();
            router.push(`/dashboard/appointments/${apptId}`);
          }}
        >
          Open details
        </ContextMenuItem>

        <ContextMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={async () => {
            onDelete?.();
            await removeAppt();
            onAfterAction?.();
          }}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
