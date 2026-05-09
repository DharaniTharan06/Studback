"use client";
import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { User } from "@/features/auth/types";
import { useUser } from "@/features/auth/queries";

import { LikeButton } from "@/features/likes/like-button";
import { Avatar } from "@/components/shared/avatar";

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
      </div>
      <p className="my-4 whitespace-pre-wrap break-words text-sm leading-7">
        {tweet.content}
      </p>
      <LikeButton id={tweet._id} kind="tweets" small />
    </article>
  );
}
