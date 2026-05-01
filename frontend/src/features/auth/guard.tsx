"use client";
import { useSyncExternalStore, type ReactNode } from "react";
import { useUser } from "./queries";
import { ApiError } from "@/lib/api/client";
import {
  EmptyState,
  ErrorState,
  VideoSkeletons,
} from "@/components/shared/states";
const subscribe = () => () => {};
export function AuthGuard({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const user = useUser();
  if (!hydrated || user.isPending) return <VideoSkeletons />;
  if (
    user.error &&
    !(user.error instanceof ApiError && user.error.status === 401)
  )
    return <ErrorState error={user.error} retry={() => user.refetch()} />;
  if (!user.data)
    return (
      <EmptyState
        title="Make yourself at home"
        description="Sign in to discover videos, keep your favorites, and connect with creators."
        href="/login"
        action="Sign in to Studback"
      />
    );
  return children;
}
