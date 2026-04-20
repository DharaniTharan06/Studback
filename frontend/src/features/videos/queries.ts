"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import type { Video, Paginated } from "./types";
export const videoKeys = {
  all: ["videos"] as const,
  feed: (query: string, sortBy: string, sortType: string) =>
    ["videos", "feed", query, sortBy, sortType] as const,
  detail: (id: string) => ["videos", "detail", id] as const,
};
export function useFeed(
  query = "",
  sortBy = "createdAt",
  sortType = "desc",
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: videoKeys.feed(query, sortBy, sortType),
    initialPageParam: 1,
    enabled,
    queryFn: async ({ pageParam, signal }) =>
      (
        await get<{ videos: Paginated<Video> }>(
          "/videos",
          { query, sortBy, sortType, page: pageParam, limit: 12 },
          signal
        )
      ).videos,
    getNextPageParam: (page) =>
      page.hasNextPage ? (page.nextPage ?? undefined) : undefined,
  });
}
export function useVideo(id: string) {
  return useQuery({
    queryKey: videoKeys.detail(id),
    queryFn: async ({ signal }) =>
      (await get<{ video: Video }>(`/videos/${id}`, undefined, signal)).video,
    enabled: !!id,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
