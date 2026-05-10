"use client";

import { useFeed } from "@/features/videos/queries";
import { ownerId } from "@/features/videos/types";
import { VideoCard } from "@/features/videos/video-card";

import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  VideoSkeletons,
} from "@/components/shared/states";

function ChannelVideos({ id }: { id: string }) {
  const feed = useFeed();
  const videos =
    feed.data?.pages
      .flatMap((page) => page.docs)
      .filter((video) => ownerId(video.owner) === id) ?? [];
  return feed.isPending ? (
    <VideoSkeletons />
  ) : feed.error ? (
    <ErrorState error={feed.error} retry={() => feed.refetch()} />
  ) : (
    <>
      {videos.length ? (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : feed.hasNextPage ? (
        <p className="py-8 text-sm text-muted-foreground">
          No videos from this creator in the pages loaded so far.
        </p>
      ) : (
        <EmptyState
          title="A story is on its way"
          description="This creator hasn’t published a video yet."
        />
      )}
      {feed.hasNextPage && (
        <Button
          variant="outline"
          className="mt-6"
          disabled={feed.isFetchingNextPage}
          onClick={() => feed.fetchNextPage()}
        >
          {feed.isFetchingNextPage
            ? "Loading…"
            : "Look for more channel videos"}
        </Button>
      )}
    </>
  );
}
