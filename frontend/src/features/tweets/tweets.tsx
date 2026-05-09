"use client";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { patch, remove } from "@/lib/api/client";
import type { User } from "@/features/auth/types";
import { useUser } from "@/features/auth/queries";

import { LikeButton } from "@/features/likes/like-button";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { Dropdown, MenuContent, menuItemClass } from "@/components/ui/menu";
import {
  EditTextDialog,
} from "@/components/shared/text-composer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

import { relativeTime } from "@/lib/utils";
interface Tweet {
  _id: string;
  content: string;
  owner: User;
  createdAt: string;
}
export const tweetKeys = {
  all: ["tweets"] as const,
  user: (id: string) => ["tweets", "user", id] as const,
  circle: (ids: string[]) => ["tweets", "circle", ...ids] as const,
};
function TweetCard({ tweet }: { tweet: Tweet }) {
  const { data: user } = useUser();
  const client = useQueryClient();
  const [edit, setEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const mutation = useMutation({
    mutationFn: () => remove(`/tweets/${tweet._id}`),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: tweetKeys.all });
      setDeleting(false);
      toast.success("Post deleted");
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <article className="border-b py-6">
      <div className="flex items-center gap-3">
        <Link href={`/c/${tweet.owner.username}`}>
          <Avatar
            name={tweet.owner.fullname ?? tweet.owner.username}
            src={tweet.owner.avatar}
          />
        </Link>
        <div className="flex-1">
          <Link
            href={`/c/${tweet.owner.username}`}
            className="text-sm font-semibold hover:text-primary"
          >
            {tweet.owner.fullname ?? tweet.owner.username}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            @{tweet.owner.username} · {relativeTime(tweet.createdAt)}
          </p>
        </div>
        {user?._id === tweet.owner._id && (
          <Dropdown.Root>
            <Dropdown.Trigger asChild>
              <Button variant="ghost" size="icon" aria-label="Post actions">
                <MoreHorizontal />
              </Button>
            </Dropdown.Trigger>
            <MenuContent>
              <Dropdown.Item
                className={menuItemClass}
                onSelect={() => setEdit(true)}
              >
                <Pencil />
                Edit
              </Dropdown.Item>
              <Dropdown.Item
                className={menuItemClass}
                onSelect={() => setDeleting(true)}
              >
                <Trash2 />
                Delete
              </Dropdown.Item>
            </MenuContent>
          </Dropdown.Root>
        )}
      </div>
      <p className="my-4 whitespace-pre-wrap break-words text-sm leading-7">
        {tweet.content}
      </p>
      <LikeButton id={tweet._id} kind="tweets" small />
      <EditTextDialog
        open={edit}
        onOpenChange={setEdit}
        content={tweet.content}
        onSave={async (content) => {
          await patch(`/tweets/${tweet._id}`, { content });
          await client.invalidateQueries({ queryKey: tweetKeys.all });
          toast.success("Post updated");
        }}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete this post?"
        description="This post will be permanently removed from your channel."
        pending={mutation.isPending}
        onConfirm={() => mutation.mutate()}
      />
    </article>
  );
}
