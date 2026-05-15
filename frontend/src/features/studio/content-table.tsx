"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { studioKeys } from "./queries";

import type { Video } from "@/features/videos/types";
import { videoKeys } from "@/features/videos/queries";

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
      <td className="px-4 text-xs whitespace-nowrap text-muted-foreground">
        {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : "—"}
      </td>
      <td className="px-4 text-sm tabular-nums">{count(video.views)}</td>
    </tr>
  );
}
