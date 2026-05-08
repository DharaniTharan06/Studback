"use client";
import { useState } from "react";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/features/auth/types";

import { useUser } from "@/features/auth/queries";
import { patch, remove } from "@/lib/api/client";
import { relativeTime } from "@/lib/utils";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { Dropdown, MenuContent, menuItemClass } from "@/components/ui/menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  EditTextDialog,
} from "@/components/shared/text-composer";

import { LikeButton } from "@/features/likes/like-button";
export interface Comment {
  _id: string;
  content: string;
  owner: User;
  createdAt: string;
}
export const commentKeys = { video: (id: string) => ["comments", id] as const };
function CommentRow({
  comment,
  videoId,
}: {
  comment: Comment;
  videoId: string;
}) {
  const { data: user } = useUser();
  const [edit, setEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => remove(`/comments/c/${comment._id}`),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: commentKeys.video(videoId) });
      toast.success("Comment deleted");
      setDeleting(false);
    },
    onError: (error) => toast.error(error.message),
  });
  const pending = comment._id.startsWith("pending-");
  return (
    <article className="flex gap-3 py-5">
      <Avatar
        src={comment.owner.avatar}
        name={comment.owner.fullname ?? comment.owner.username}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold">
            @{comment.owner.username}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {pending ? "Posting…" : relativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
          {comment.content}
        </p>
        {!pending && (
          <div className="mt-2">
            <LikeButton id={comment._id} kind="comments" small />
          </div>
        )}
      </div>
      {user?._id === comment.owner._id && !pending && (
        <Dropdown.Root>
          <Dropdown.Trigger asChild>
            <Button variant="ghost" size="icon" aria-label="Comment actions">
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
      <EditTextDialog
        open={edit}
        onOpenChange={setEdit}
        content={comment.content}
        onSave={async (content) => {
          await patch(`/comments/c/${comment._id}`, { content });
          await client.invalidateQueries({
            queryKey: commentKeys.video(videoId),
          });
          toast.success("Comment updated");
        }}
      />
      <ConfirmDialog
        open={deleting}
        onOpenChange={setDeleting}
        title="Delete this comment?"
        description="Your comment will be permanently removed."
        pending={mutation.isPending}
        onConfirm={() => mutation.mutate()}
      />
    </article>
  );
}
