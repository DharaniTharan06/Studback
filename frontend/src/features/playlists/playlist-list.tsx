"use client";
import Link from "next/link";
import { useState } from "react";
import { ListVideo, Plus, ArrowUpRight } from "lucide-react";
import { useUser } from "@/features/auth/queries";
import { usePlaylists } from "./queries";
import { PlaylistForm } from "./playlist-form";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  PageHeading,
} from "@/components/shared/states";
import { relativeTime } from "@/lib/utils";
export function PlaylistList({ userId }: { userId: string }) {
  const query = usePlaylists(userId);
  return query.isPending ? (
    <div className="video-grid" aria-label="Loading playlists" role="status">
      {[0, 1, 2].map((i) => (
        <div className="skeleton h-56" key={i} />
      ))}
    </div>
  ) : query.error ? (
    <ErrorState error={query.error} retry={() => query.refetch()} />
  ) : query.data?.length ? (
    <div className="video-grid">
      {query.data.map((playlist) => (
        <Link
          href={`/playlist/${playlist._id}`}
          key={playlist._id}
          className="group overflow-hidden rounded-xl border bg-surface transition-colors hover:border-primary/40"
        >
          <div className="ambient flex h-36 items-end justify-between p-5">
            <ListVideo className="size-9 text-primary" />
            <span className="text-xs text-muted-foreground">
              {playlist.videos.filter(Boolean).length} videos
            </span>
          </div>
          <div className="p-5">
            <h2 className="flex items-center justify-between gap-3 text-base font-semibold">
              {playlist.name}
              <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary" />
            </h2>
            <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted-foreground">
              {playlist.description}
            </p>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Created {relativeTime(playlist.createdAt)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  ) : (
    <EmptyState
      title="The good ones, all together"
      description="Create a playlist and give your favorite videos a place to live."
    />
  );
}
export function PlaylistsView() {
  const { data: user } = useUser();
  const [create, setCreate] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="Your collection"
        title="Worth keeping"
        description="A place for your favorites, future watches, and new obsessions."
      >
        <Button onClick={() => setCreate(true)}>
          <Plus />
          New playlist
        </Button>
      </PageHeading>
      <PlaylistList userId={user?._id ?? ""} />
      <PlaylistForm open={create} onOpenChange={setCreate} />
    </>
  );
}
