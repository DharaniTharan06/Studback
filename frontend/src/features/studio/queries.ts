"use client";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import type { Video } from "@/features/videos/types";
export interface Stats {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalSubscribers: number;
}
export const studioKeys = {
  all: ["studio"] as const,
  videos: ["studio", "videos"] as const,
  stats: ["studio", "stats"] as const,
};
export function useStudioVideos() {
  return useQuery({
    queryKey: studioKeys.videos,
    queryFn: async ({ signal }) =>
      (await get<{ videos: Video[] }>("/dashboard/videos", undefined, signal))
        .videos,
  });
}
export function useStats() {
  return useQuery({
    queryKey: studioKeys.stats,
    queryFn: async ({ signal }) =>
      (await get<{ stats: Stats }>("/dashboard/stats", undefined, signal))
        .stats,
  });
}
