"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ListVideo } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/features/auth/queries";
import { patch } from "@/lib/api/client";
import { Dialog } from "@/components/ui/dialog";

import { ErrorState } from "@/components/shared/states";
import { usePlaylists, playlistKeys } from "./queries";

import type { Playlist } from "./types";
function contains(playlist: Playlist, id: string) {
  return playlist.videos.some((video) =>
    typeof video === "string" ? video === id : video?._id === id
  );
}
export function SavePlaylistDialog({
  videoId,
  open,
  onOpenChange,
}: {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: user } = useUser();
  const [create, setCreate] = useState(false);
  const client = useQueryClient();
  const key = playlistKeys.user(user?._id ?? "");
  const playlists = usePlaylists(user?._id ?? "", open);
  const mutation = useMutation({
    mutationFn: ({ playlist, saved }: { playlist: Playlist; saved: boolean }) =>
      patch(`/playlist/${saved ? "remove" : "add"}/${videoId}/${playlist._id}`),
    onMutate: async ({ playlist, saved }) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Playlist[]>(key);
      client.setQueryData<Playlist[]>(key, (list) =>
        list?.map((item) =>
          item._id === playlist._id
            ? {
                ...item,
                videos: saved
                  ? item.videos.filter(
                      (video) =>
                        (typeof video === "string" ? video : video?._id) !==
                        videoId
                    )
                  : [...item.videos, videoId],
              }
            : item
        )
      );
      return { previous };
    },
    onError: (error, _, context) => {
      client.setQueryData(key, context?.previous);
      toast.error(error.message);
    },
    onSettled: () => client.invalidateQueries({ queryKey: playlistKeys.all }),
  });
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        title="Save for another time"
        description="Choose a playlist for this video."
      >
        {playlists.isPending ? (
          <div className="skeleton h-24" />
        ) : playlists.error ? (
          <ErrorState
            error={playlists.error}
            retry={() => playlists.refetch()}
          />
        ) : (
          <div className="space-y-2">
            {playlists.data?.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">
                Your first collection is one click away.
              </p>
            )}
            {playlists.data?.map((playlist) => {
              const saved = contains(playlist, videoId);
              return (
                <button
                  key={playlist._id}
                  disabled={mutation.isPending}
                  aria-pressed={saved}
                  onClick={() => mutation.mutate({ playlist, saved })}
                  className="flex min-h-12 w-full items-center gap-3 rounded-lg border bg-background px-3 text-left text-sm hover:bg-muted disabled:opacity-50"
                >
                  <ListVideo className="size-4 text-muted-foreground" />
                  <span className="flex-1">{playlist.name}</span>
                  {saved && <Check className="size-4 text-primary" />}
                </button>
              );
            })}
          </div>
        )}
      </Dialog>
    </>
  );
}
