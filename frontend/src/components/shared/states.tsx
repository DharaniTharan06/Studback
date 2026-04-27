"use client";
import Link from "next/link";
import { AlertCircle, ArrowRight, Film, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
export function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center py-12 text-center">
      <span className="mb-5 flex size-14 items-center justify-center rounded-2xl border bg-surface">
        <Film className="size-6 text-primary" />
      </span>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {href && (
        <Button asChild className="mt-6">
          <Link href={href}>
            {action ?? "Explore videos"}
            <ArrowRight />
          </Link>
        </Button>
      )}
    </div>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: Error;
  retry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-56 flex-col items-center justify-center gap-4 text-center"
    >
      <AlertCircle className="size-8 text-destructive" />
      <h2 className="text-lg font-semibold">We couldn’t load this</h2>
      <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
      {retry && (
        <Button variant="outline" onClick={retry}>
          <RefreshCw />
          Try again
        </Button>
      )}
    </div>
  );
}
