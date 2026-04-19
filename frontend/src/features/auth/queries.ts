"use client";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api/client";
import type { User } from "./types";
export const authKey = ["auth", "me"] as const;
export function useUser() {
  return useQuery({
    queryKey: authKey,
    queryFn: ({ signal }) =>
      get<User>("/users/current-user", undefined, signal),
    retry: false,
    staleTime: 60000,
  });
}
