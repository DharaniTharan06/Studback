"use client";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import { VideoCard } from "./video-card";
import type { Video } from "./types";
import {
  EmptyState,
  ErrorState,
  PageHeading,
  VideoSkeletons,
} from "@/components/shared/states";
export function Library({ kind }: { kind: "history" | "liked-videos" }) {
  const history = kind === "history";
  const query = useQuery({
    queryKey: ["library", kind],
    queryFn: async ({ signal }) =>
      history
        ? get<Video[]>("/users/history", undefined, signal)
        : (
            await get<{ likes: { video: Video | null }[] }>(
              "/likes/videos",
              undefined,
              signal
            )
          ).likes.flatMap((like) => (like.video ? [like.video] : [])),
  });
  return (
    <>
      <PageHeading
        eyebrow="Your collection"
        title={history ? "A trail of curiosity" : "The ones you loved"}
        description={
          history
            ? "The videos in your watch history, all in one place."
            : "Good watches deserve a second look."
        }
      />
      {query.isPending ? (
        <VideoSkeletons />
      ) : query.error ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : query.data?.length ? (
        <div className="video-grid">
          {query.data.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={
            history
              ? "Your story starts with a watch"
              : "A little appreciation goes a long way"
          }
          description={
            history
              ? "Videos in your watch history will appear here."
              : "Like a video and you’ll find it here when you want to come back."
          }
          href="/"
        />
      )}
    </>
  );
}
