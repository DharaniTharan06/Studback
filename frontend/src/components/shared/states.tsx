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
export function VideoSkeletons({ amount = 6 }: { amount?: number }) {
  return (
    <div className="video-grid" aria-label="Loading videos" role="status">
      {Array.from({ length: amount }, (_, i) => (
        <div key={i}>
          <div className="skeleton aspect-video" />
          <div className="mt-4 flex gap-3">
            <div className="skeleton size-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-3 w-3/5" />
              <div className="skeleton h-3 w-2/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
