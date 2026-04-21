"use client";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import type { User } from "@/features/auth/types";
export interface Subscription {
  _id: string;
  channel: User;
}
export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  user: (id: string) => ["subscriptions", id] as const,
};
export function useSubscriptions(id: string) {
  return useQuery({
    queryKey: subscriptionKeys.user(id),
    queryFn: async ({ signal }) =>
      (
        await get<{ subscribedChannels: Subscription[] }>(
          `/subscriptions/u/${id}`,
          undefined,
          signal
        )
      ).subscribedChannels,
    enabled: !!id,
  });
}
