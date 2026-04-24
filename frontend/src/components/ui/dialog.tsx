"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[var(--overlay)] backdrop-blur-sm" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border bg-surface-elevated p-6 shadow-[var(--shadow)]",
            className
          )}
        >
          <DialogPrimitive.Title className="pr-8 text-xl font-semibold tracking-tight">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 mb-6 text-sm text-muted-foreground">
            {description}
          </DialogPrimitive.Description>
          {children}
          <DialogPrimitive.Close
            aria-label="Close dialog"
            className="absolute top-5 right-5 rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
