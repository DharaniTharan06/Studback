"use client";
import { useState } from "react";

import type { User } from "@/features/auth/types";

import { useUser } from "@/features/auth/queries";

import { relativeTime } from "@/lib/utils";
import { Avatar } from "@/components/shared/avatar";

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
    </article>
  );
}
