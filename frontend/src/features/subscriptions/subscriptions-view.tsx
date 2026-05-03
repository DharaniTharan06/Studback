"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useUser } from "@/features/auth/queries";
import { useSubscriptions } from "./queries";
import { Avatar } from "@/components/shared/avatar";
import {
  EmptyState,
  ErrorState,
  PageHeading,
} from "@/components/shared/states";
export function SubscriptionsView() {
  const { data: user } = useUser();
  const query = useSubscriptions(user?._id ?? "");
  return (
    <>
      <PageHeading
        eyebrow="Your people"
        title="A familiar perspective"
        description="The creators you’ve chosen to keep up with."
      />
      {query.isPending ? (
        <div
          className="skeleton h-32"
          role="status"
          aria-label="Loading subscriptions"
        />
      ) : query.error ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : query.data?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {query.data.map((item) => (
            <Link
              key={item._id}
              href={`/c/${item.channel.username}`}
              className="flex items-center gap-4 rounded-xl border bg-surface p-6 hover:bg-muted"
            >
              <Avatar name={item.channel.username} className="size-12" />
              <div className="flex-1">
                <h2 className="text-sm font-semibold">
                  {item.channel.username}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  View channel
                </p>
              </div>
              <ArrowUpRight className="size-4 text-primary" />
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Find your people"
          description="Subscribe to a creator you enjoy. Their channel will be waiting here."
          href="/"
        />
      )}
    </>
  );
}
