"use client";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Pencil, Trash2, ListVideo, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePlaylist, playlistKeys } from "./queries";
import { PlaylistForm } from "./playlist-form";
import { useUser } from "@/features/auth/queries";
import { ownerId } from "@/features/videos/types";
import { VideoCard } from "@/features/videos/video-card";
import { remove, patch } from "@/lib/api/client";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/shared/states";
export function PlaylistView({ id }: { id: string }) {
  const query = usePlaylist(id);
  const { data: user } = useUser();
  const client = useQueryClient();
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deletion = useMutation({
    mutationFn: () => remove(`/playlist/${id}`),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: playlistKeys.all });
      router.push("/playlists");
      toast.success("Playlist deleted");
    },
    onError: (error) => toast.error(error.message),
  });
  const removal = useMutation({
    mutationFn: (videoId: string) => patch(`/playlist/remove/${videoId}/${id}`),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: playlistKeys.all });
      toast.success("Video removed from playlist");
    },
    onError: (error) => toast.error(error.message),
  });
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
          {own && (
            <>
              <Button variant="outline" onClick={() => setEdit(true)}>
                <Pencil />
                Edit playlist
              </Button>
              <Button
                variant="ghost"
                aria-label="Delete playlist"
                onClick={() => setDeleting(true)}
              >
                <Trash2 />
              </Button>
            </>
          )}
        </div>
      </section>
      {videos.length ? (
        <div className="video-grid">
          {videos.map((video) => (
            <div key={video._id}>
              <VideoCard video={video} playlistId={id} />
              {own && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  disabled={removal.isPending}
                  onClick={() => removal.mutate(video._id)}
                >
                  <X />
                  Remove
                </Button>
              )}
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
      <PlaylistForm open={edit} onOpenChange={setEdit} playlist={playlist} />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete this playlist?"
        description="The playlist will be removed. The videos themselves will stay on Studback."
        pending={deletion.isPending}
        onConfirm={() => deletion.mutate()}
      />
    </>
  );
}
