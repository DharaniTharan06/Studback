"use client";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Play, ListVideo } from "lucide-react";
import { useRouter } from "next/navigation";

import { usePlaylist } from "./queries";

import { useUser } from "@/features/auth/queries";
import { ownerId } from "@/features/videos/types";
import { VideoCard } from "@/features/videos/video-card";

import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/shared/states";
export function PlaylistView({ id }: { id: string }) {
  const query = usePlaylist(id);
  const { data: user } = useUser();
  const client = useQueryClient();
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  if (query.isPending)
    return (
      <div
        className="skeleton h-56"
        aria-label="Loading playlist"
        role="status"
      />
    );
  if (query.error)
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  const playlist = query.data;
  const own = ownerId(playlist.owner) === user?._id;
  const videos = playlist.videos.flatMap((video) =>
    typeof video === "object" && video ? [video] : []
  );
  return (
    <>
      <section className="ambient mb-8 rounded-xl border p-7">
        <ListVideo className="mb-5 size-8 text-primary" />
        <p className="eyebrow mb-2">A collection · {videos.length} videos</p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {playlist.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {playlist.description}
        </p>
        {playlist.owner && typeof playlist.owner === "object" && (
          <Link
            href={`/c/${playlist.owner.username}`}
            className="mt-3 inline-block text-xs text-primary"
          >
            By {playlist.owner.fullname ?? playlist.owner.username}
          </Link>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          {videos[0] && (
            <Button asChild>
              <Link href={`/watch/${videos[0]._id}?playlist=${id}`}>
                <Play />
                Play all
              </Link>
            </Button>
          )}
        </div>
      </section>
      {videos.length ? (
        <div className="video-grid">
          {videos.map((video) => (
            <div key={video._id}>
              <VideoCard video={video} playlistId={id} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="A little room for inspiration"
          description="Save a video to this playlist to start your collection."
          href="/"
        />
      )}
    </>
  );
}
