"use client";
import { ErrorState } from "@/components/shared/states";
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="page-wrap">
      <ErrorState error={error} retry={reset} />
    </div>
  );
}
