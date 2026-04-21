"use client";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import type { Playlist } from "./types";
export const playlistKeys = {
  all: ["playlists"] as const,
  user: (id: string) => ["playlists", "user", id] as const,
  detail: (id: string) => ["playlists", "detail", id] as const,
};
export function usePlaylists(userId: string, enabled = true) {
  return useQuery({
    queryKey: playlistKeys.user(userId),
    queryFn: async ({ signal }) =>
      (
        await get<{ userPlaylists: Playlist[] }>(
          `/playlist/user/${userId}`,
          undefined,
          signal
        )
      ).userPlaylists,
    enabled: !!userId && enabled,
  });
}
export function usePlaylist(id: string) {
  return useQuery({
    queryKey: playlistKeys.detail(id),
    queryFn: async ({ signal }) =>
      (await get<{ playlist: Playlist }>(`/playlist/${id}`, undefined, signal))
        .playlist,
    enabled: !!id,
  });
}
