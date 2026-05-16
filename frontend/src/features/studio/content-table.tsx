"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useStudioVideos, studioKeys } from "./queries";
import { EditVideoDialog } from "./video-form";
import type { Video } from "@/features/videos/types";
import { videoKeys } from "@/features/videos/queries";
import { patch, remove } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState, ErrorState } from "@/components/shared/states";
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
  const deletion = useMutation({
    mutationFn: () => remove(`/videos/${video._id}`),
    onSuccess: () => {
      setDeleting(false);
      invalidate();
      toast.success("Video deleted");
    },
    onError: (error) => toast.error(error.message),
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
      <td className="px-2">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${video.title}`}
            onClick={() => setEdit(true)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${video.title}`}
            onClick={() => setDeleting(true)}
          >
            <Trash2 />
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={`Watch ${video.title}`}
          >
            <Link href={`/watch/${video._id}`}>
              <ExternalLink />
            </Link>
          </Button>
        </div>
        <EditVideoDialog video={video} open={edit} onOpenChange={setEdit} />
        <ConfirmDialog
          open={deleting}
          onOpenChange={setDeleting}
          title="Delete this video?"
          description="The video will be permanently removed from Studback. This can’t be undone."
          pending={deletion.isPending}
          onConfirm={() => deletion.mutate()}
        />
      </td>
    </tr>
  );
}
export function ContentTable({ limit }: { limit?: number }) {
  const query = useStudioVideos();
  if (query.isPending)
    return (
      <div aria-label="Loading your videos" role="status" className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div className="skeleton h-20" key={i} />
        ))}
      </div>
    );
  if (query.error)
    return <ErrorState error={query.error} retry={() => query.refetch()} />;
  if (!query.data?.length)
    return (
      <EmptyState
        title="Every creator starts somewhere"
        description="Upload your first video. Bring your perspective to the world."
        href="/studio/upload"
        action="Upload your first video"
      />
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <caption className="sr-only">
          Your uploaded videos and publication status
        </caption>
        <thead className="text-[11px] text-muted-foreground">
          <tr>
            <th scope="col" className="pb-4 font-medium">
              Video
            </th>
            <th scope="col" className="px-4 pb-4 font-medium">
              Visibility
            </th>
            <th scope="col" className="px-4 pb-4 font-medium">
              Uploaded
            </th>
            <th scope="col" className="px-4 pb-4 font-medium">
              Views
            </th>
            <th scope="col" className="px-4 pb-4 font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {(limit ? query.data.slice(0, limit) : query.data).map((video) => (
            <ContentRow key={video._id} video={video} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
