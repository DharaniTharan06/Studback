"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { useVideo, useFeed } from "./queries";
import { Player } from "./player";

import { usePlayer } from "@/stores/player";
import { useChannel } from "@/features/channels/queries";
import { useUser } from "@/features/auth/queries";
import { SubscribeButton } from "@/features/subscriptions/subscribe-button";

import { Comments } from "@/features/comments/comments";
import { Avatar } from "@/components/shared/avatar";
import { ErrorState, VideoSkeletons } from "@/components/shared/states";
import { Button } from "@/components/ui/button";

import { count, cn } from "@/lib/utils";
function Creator({ username }: { username: string }) {
  const channel = useChannel(username);
  const { data: user } = useUser();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={`/c/${username}`} className="flex items-center gap-3">
        <Avatar
          src={channel.data?.avatar}
          name={channel.data?.fullname ?? username}
          className="size-11"
        />
        <div>
          <p className="text-sm font-semibold">
            {channel.data?.fullname ?? username}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {channel.data
              ? `${count(channel.data.subscribersCount)} subscribers`
              : `@${username}`}
          </p>
        </div>
      </Link>
      {channel.data &&
        (user?._id === channel.data._id ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/studio">Studio</Link>
          </Button>
        ) : (
          <SubscribeButton channel={channel.data} />
        ))}
    </div>
  );
}
export function WatchView({ id }: { id: string }) {
  const query = useVideo(id);
  const feed = useFeed();
  const theater = usePlayer((state) => state.theater);
  const [save, setSave] = useState(false);
  const [share, setShare] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const params = useSearchParams();
  const playlistId = params.get("playlist");
  if (query.isPending)
    return (
      <>
        <div className="skeleton mb-6 aspect-video max-w-5xl" />
        <VideoSkeletons amount={3} />
      </>
    );
  if (query.error)
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  const video = query.data;
  const owner = typeof video.owner === "object" ? video.owner : undefined;
  return (
    <div
      className={cn(
        "grid gap-8",
        theater ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1fr)_320px]"
      )}
    >
      <div className="min-w-0">
        <Player
          key={id}
          src={video.videofile}
          poster={video.thumbnail}
          title={video.title}
          videoRef={videoRef}
        />
        <h1 className="mt-5 text-xl leading-8 font-semibold tracking-tight md:text-2xl">
          {video.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
          {owner?.username && <Creator username={owner.username} />}
        </div>
        <Comments videoId={id} />
      </div>
    </div>
  );
}
