"use client";
import { useState } from "react";
import { useFeed } from "./queries";
import { VideoCard } from "./video-card";
import {
  EmptyState,
  ErrorState,
  VideoSkeletons,
} from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const sorts = [
  { label: "Latest", field: "createdAt", direction: "desc" },
  { label: "Most watched", field: "views", direction: "desc" },
  { label: "Quick watches", field: "duration", direction: "asc" },
  { label: "Longer stories", field: "duration", direction: "desc" },
];
export function Feed({ query = "" }: { query?: string }) {
  const [sort, setSort] = useState(0);
  const option = sorts[sort];
  const feed = useFeed(query, option.field, option.direction);
  const videos = feed.data?.pages.flatMap((page) => page.docs) ?? [];
  return (
    <>
      <div
        className="mb-7 flex gap-2 overflow-x-auto pb-1"
        aria-label="Sort videos"
      >
        {sorts.map((item, index) => (
          <button
            key={item.label}
            aria-pressed={index === sort}
            onClick={() => setSort(index)}
            className={cn(
              "min-h-9 shrink-0 rounded-lg px-4 text-xs font-medium transition-colors",
              index === sort
                ? "bg-foreground text-background"
                : "bg-surface text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {feed.isPending ? (
        <VideoSkeletons />
      ) : feed.error ? (
        <ErrorState error={feed.error} retry={() => feed.refetch()} />
      ) : videos.length ? (
        <>
          <div className="video-grid">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
          {feed.hasNextPage && (
            <div className="mt-10 text-center">
              <Button
                variant="outline"
                disabled={feed.isFetchingNextPage}
                onClick={() => feed.fetchNextPage()}
              >
                {feed.isFetchingNextPage ? "Loading…" : "Discover more"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title={query ? "No videos found" : "The next great watch starts here"}
          description={
            query
              ? "Try a different title or a few simpler words."
              : "Be the first to share a video. Your audience is waiting."
          }
          href={query ? undefined : "/studio/upload"}
          action="Upload a video"
        />
      )}
    </>
  );
}
