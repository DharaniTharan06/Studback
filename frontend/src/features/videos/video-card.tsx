"use client";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal, ListPlus, Link as LinkIcon, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Video } from "./types";
import { count, duration, relativeTime, safeMediaUrl } from "@/lib/utils";
import { Avatar } from "@/components/shared/avatar";
import { Dropdown, MenuContent, menuItemClass } from "@/components/ui/menu";
import { Button } from "@/components/ui/button";
import { SavePlaylistDialog } from "@/features/playlists/save-dialog";
export function VideoCard({
  video,
  playlistId,
}: {
  video: Video;
  playlistId?: string;
}) {
  const [save, setSave] = useState(false);
  const creator = typeof video.owner === "object" ? video.owner : undefined;
  const thumbnail = safeMediaUrl(video.thumbnail);
  const href = `/watch/${video._id}${playlistId ? `?playlist=${playlistId}` : ""}`;
  return (
    <article className="group min-w-0">
      <Link
        href={href}
        className="relative block aspect-video overflow-hidden rounded-xl bg-muted"
      >
        <span className="absolute inset-0 flex items-center justify-center">
          <Play className="size-8 text-muted-foreground" />
        </span>
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1150px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
          />
        )}
        <span className="duration-badge absolute right-2 bottom-2 rounded px-1.5 py-.5 text-[11px] font-medium tabular-nums">
          {duration(video.duration)}
        </span>
      </Link>
      <div className="mt-3.5 flex items-start gap-3">
        <Avatar
          src={creator?.avatar}
          name={creator?.fullname ?? creator?.username ?? "•"}
        />
        <div className="min-w-0 flex-1">
          <Link
            href={href}
            className="line-clamp-2 text-[14px] leading-[1.5] font-semibold tracking-[-.015em] hover:text-primary"
          >
            {video.title}
          </Link>
          {creator?.username ? (
            <Link
              href={`/c/${creator.username}`}
              className="mt-1 block text-xs text-muted-foreground hover:text-foreground"
            >
              {creator.fullname ?? creator.username}
            </Link>
          ) : (
            <Link
              href={href}
              className="mt-1 block text-xs text-muted-foreground"
            >
              View creator
            </Link>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            {count(video.views)} views
            {video.createdAt ? ` · ${relativeTime(video.createdAt)}` : ""}
          </p>
        </div>
        <Dropdown.Root>
          <Dropdown.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 min-h-7"
              aria-label={`Actions for ${video.title}`}
            >
              <MoreHorizontal />
            </Button>
          </Dropdown.Trigger>
          <MenuContent>
            <Dropdown.Item
              className={menuItemClass}
              onSelect={() => setSave(true)}
            >
              <ListPlus />
              Save to playlist
            </Dropdown.Item>
            <Dropdown.Item
              className={menuItemClass}
              onSelect={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `${location.origin}/watch/${video._id}`
                  );
                  toast.success("Video link copied");
                } catch {
                  toast.error("Your browser couldn’t copy the link");
                }
              }}
            >
              <LinkIcon />
              Copy link
            </Dropdown.Item>
          </MenuContent>
        </Dropdown.Root>
      </div>
      <SavePlaylistDialog
        videoId={video._id}
        open={save}
        onOpenChange={setSave}
      />
    </article>
  );
}
