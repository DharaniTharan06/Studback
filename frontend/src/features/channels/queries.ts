"use client";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import type { User } from "@/features/auth/types";
export interface Channel extends User {
  subscribersCount: number;
  channelsSubscribedToCount: number;
  isSubscribed: boolean;
}
export const channelKeys = {
  all: ["channels"] as const,
  detail: (username: string) => ["channels", username] as const,
};
export function useChannel(username: string) {
  return useQuery({
    queryKey: channelKeys.detail(username),
    queryFn: ({ signal }) =>
      get<Channel>(
        `/users/c/${encodeURIComponent(username)}`,
        undefined,
        signal
      ),
    enabled: !!username,
  });
}
