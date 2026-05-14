"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { useVideo, useFeed } from "./queries";
import { Player } from "./player";
import { VideoCard } from "./video-card";
import { usePlayer } from "@/stores/player";
import { useChannel } from "@/features/channels/queries";
import { useUser } from "@/features/auth/queries";
import { SubscribeButton } from "@/features/subscriptions/subscribe-button";

import { usePlaylist } from "@/features/playlists/queries";
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
function Queue({ id, current }: { id: string; current: string }) {
  const query = usePlaylist(id);
  if (!query.data)
    return query.error ? (
      <ErrorState error={query.error} />
    ) : (
      <div className="skeleton h-32" />
    );
  const videos = query.data.videos.flatMap((video) =>
    typeof video === "object" && video ? [video] : []
  );
  const index = videos.findIndex((video) => video._id === current);
  const next = videos[index + 1];
  return (
    <div className="mb-6 rounded-xl border bg-surface p-4">
      <Link href={`/playlist/${id}`} className="text-sm font-semibold">
        {query.data.name}
      </Link>
      <p className="mt-1 text-xs text-muted-foreground">
        {index >= 0 ? index + 1 : "—"} of {videos.length} videos
      </p>
      {next && (
        <Button asChild variant="secondary" size="sm" className="mt-3">
          <Link href={`/watch/${next._id}?playlist=${id}`}>
            Next in playlist
            <ArrowRight />
          </Link>
        </Button>
      )}
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
        <details className="mt-6 rounded-xl bg-surface p-4">
          <summary className="cursor-pointer text-xs font-medium">
            {count(video.views)} views{" "}
            {video.createdAt &&
              ` · ${new Date(video.createdAt).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}`}
            <span className="ml-3 text-muted-foreground">Description</span>
          </summary>
          <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
            {video.description || "No description provided."}
          </p>
        </details>
        <Comments videoId={id} />
      </div>
      <aside
        className={cn(theater && "border-t pt-8")}
        aria-label="More videos"
      >
        {playlistId && <Queue id={playlistId} current={id} />}
        <h2 className="mb-5 text-sm font-semibold">Keep exploring</h2>
        {feed.isPending ? (
          <VideoSkeletons amount={2} />
        ) : feed.error ? (
          <ErrorState error={feed.error} retry={() => feed.refetch()} />
        ) : (
          <div className={cn("space-y-6", theater && "video-grid space-y-0")}>
            {feed.data?.pages
              .flatMap((page) => page.docs)
              .filter((item) => item._id !== id)
              .slice(0, 6)
              .map((item) => (
                <VideoCard key={item._id} video={item} />
              ))}
          </div>
        )}
      </aside>
    </div>
  );
}
