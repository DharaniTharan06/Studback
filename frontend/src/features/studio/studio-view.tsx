"use client";
import Link from "next/link";

import {
  Eye,
  Users,
  ThumbsUp,
  Film,
  ArrowUpRight,
  Upload,
  ArrowRight,
} from "lucide-react";
import { useStats } from "./queries";
import { ContentTable } from "./content-table";
import { useUser } from "@/features/auth/queries";

import { count } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  ErrorState,
  PageHeading,
} from "@/components/shared/states";
export function StudioOverview() {
  const stats = useStats();
  const { data: user } = useUser();
  return (
    <>
      <PageHeading
        eyebrow="Creator Studio"
        title={`Your perspective matters${user?.fullname ? `, ${user.fullname.split(" ")[0]}` : ""}.`}
        description="A clear view of what you’re building."
      >
        <Button asChild>
          <Link href="/studio/upload">
            <Upload />
            Upload video
          </Link>
        </Button>
      </PageHeading>
      {stats.isPending ? (
        <div
          className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4"
          aria-label="Loading analytics"
          role="status"
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-36" />
          ))}
        </div>
      ) : stats.error ? (
        <ErrorState error={stats.error} retry={() => stats.refetch()} />
      ) : (
        <div className="mb-10 grid grid-cols-2 divide-x divide-y rounded-xl border bg-surface lg:grid-cols-4">
          {[
            { key: "totalViews", label: "Total views", icon: Eye },
            { key: "totalSubscribers", label: "Subscribers", icon: Users },
            { key: "totalLikes", label: "Video likes", icon: ThumbsUp },
            { key: "totalVideos", label: "Videos uploaded", icon: Film },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Icon className="size-4 text-primary" />
              </div>
              <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums">
                {count(stats.data?.[key as keyof typeof stats.data] ?? 0)}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">All time</p>
            </div>
          ))}
        </div>
      )}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your latest stories</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/studio/content">
            All content
            <ArrowRight />
          </Link>
        </Button>
      </div>
      <ContentTable limit={5} />
      <section className="ambient mt-10 flex flex-wrap items-center justify-between gap-5 rounded-xl border p-6">
        <div>
          <p className="eyebrow mb-2">Keep the conversation going</p>
          <h2 className="text-xl font-semibold tracking-tight">
            There’s more to your story.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Share an update with your community between uploads.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/tweets">
            Write a post
            <ArrowUpRight />
          </Link>
        </Button>
      </section>
    </>
  );
}
