"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import { studioKeys } from "./queries";

import type { Video } from "@/features/videos/types";
import { videoKeys } from "@/features/videos/queries";
import { patch } from "@/lib/api/client";

import { count, safeMediaUrl } from "@/lib/utils";
function ContentRow({ video }: { video: Video }) {
  const [edit, setEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const client = useQueryClient();
  const thumbnail = safeMediaUrl(video.thumbnail);
  function invalidate() {
    client.invalidateQueries({ queryKey: studioKeys.all });
    client.invalidateQueries({ queryKey: videoKeys.all });
  }
  const publish = useMutation({
    mutationFn: () =>
      patch<{ ispublished: boolean }>(`/videos/toggle/publish/${video._id}`),
    onMutate: async () => {
      await client.cancelQueries({ queryKey: studioKeys.videos });
      const previous = client.getQueryData<Video[]>(studioKeys.videos);
      client.setQueryData<Video[]>(studioKeys.videos, (current) =>
        current?.map((item) =>
          item._id === video._id
            ? { ...item, ispublished: !item.ispublished }
            : item
        )
      );
      return { previous };
    },
    onError: (error, _, context) => {
      client.setQueryData(studioKeys.videos, context?.previous);
      toast.error(error.message);
    },
    onSettled: invalidate,
  });
  return (
    <tr className="border-t">
      <td className="min-w-72 py-4 pr-5">
        <div className="flex gap-3">
          <Link
            href={`/watch/${video._id}`}
            className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
          >
            {thumbnail && (
              <Image
                src={thumbnail}
                alt={video.title}
                fill
                sizes="96px"
                className="object-cover"
              />
            )}
          </Link>
          <div className="min-w-0">
            <Link
              href={`/watch/${video._id}`}
              className="line-clamp-2 text-sm font-medium hover:text-primary"
            >
              {video.title}
            </Link>
            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
              {video.description}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4">
        <button
          role="switch"
          aria-label={`Publish ${video.title}`}
          aria-checked={!!video.ispublished}
          disabled={publish.isPending}
          onClick={() => publish.mutate()}
          className="inline-flex min-h-10 items-center gap-2 rounded-md px-2 text-xs disabled:opacity-50"
        >
          <span
            className={`relative h-5 w-9 rounded-full ${video.ispublished ? "bg-primary" : "bg-border"}`}
          >
            <span
              className={`absolute top-0.5 left-0 size-4 rounded-full bg-primary-foreground transition-transform ${video.ispublished ? "translate-x-[18px]" : "translate-x-0.5"}`}
            />
          </span>
          {video.ispublished ? "Public" : "Private"}
        </button>
      </td>
      <td className="px-4 text-xs whitespace-nowrap text-muted-foreground">
        {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : "—"}
      </td>
      <td className="px-4 text-sm tabular-nums">{count(video.views)}</td>
    </tr>
  );
}
