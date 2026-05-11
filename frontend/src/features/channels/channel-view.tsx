"use client";
import Image from "next/image";

import { useState } from "react";

import { useChannel } from "./queries";
import { useUser } from "@/features/auth/queries";
import { useFeed } from "@/features/videos/queries";
import { ownerId } from "@/features/videos/types";
import { VideoCard } from "@/features/videos/video-card";

import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  VideoSkeletons,
} from "@/components/shared/states";
import { count, safeMediaUrl } from "@/lib/utils";

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
export function ChannelView({ username }: { username: string }) {
  const query = useChannel(username);
  const { data: user } = useUser();
  const [tab, setTab] = useState("Videos");
  if (query.isPending)
    return (
      <>
        <div className="skeleton h-48" />
        <div className="skeleton my-8 h-20" />
        <VideoSkeletons />
      </>
    );
  if (query.error)
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  const channel = query.data;
  const cover = safeMediaUrl(channel.coverimage);
  const own = channel._id === user?._id;
  return (
    <>
      <div className="ambient relative h-40 overflow-hidden rounded-xl border md:h-56">
        {cover ? (
          <Image
            src={cover}
            alt={`${channel.fullname ?? username} channel cover`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-end px-10">
            <span className="text-4xl font-semibold tracking-[-.06em] text-primary/35 md:text-6xl">
              a different perspective.
            </span>
          </div>
        )}
      </div>
      <div className="my-7 flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <Avatar
            src={channel.avatar}
            name={channel.fullname ?? username}
            className="size-20 text-2xl md:size-24"
          />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {channel.fullname ?? username}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">@{username}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {count(channel.subscribersCount)} subscribers ·{" "}
              {count(channel.channelsSubscribedToCount)} subscriptions
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
