"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { get, post, patch, remove } from "@/lib/api/client";
import type { User } from "@/features/auth/types";
import { useUser } from "@/features/auth/queries";

import { LikeButton } from "@/features/likes/like-button";
import { Avatar } from "@/components/shared/avatar";
import { Button } from "@/components/ui/button";
import { Dropdown, MenuContent, menuItemClass } from "@/components/ui/menu";
import {
  TextComposer,
  EditTextDialog,
} from "@/components/shared/text-composer";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  EmptyState,
  ErrorState,
} from "@/components/shared/states";
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
function Composer() {
  const { data: user } = useUser();
  const client = useQueryClient();
  return (
    <div className="mb-4 rounded-xl border bg-surface p-5">
      <div className="mb-4 flex items-center gap-3">
        <Avatar name={user?.username} src={user?.avatar} />
        <p className="text-sm font-medium">What’s on your mind?</p>
      </div>
      <TextComposer
        label="Post"
        placeholder="Share an idea, an update, or a little inspiration…"
        onSubmit={async (content) => {
          await post("/tweets", { content });
          await client.invalidateQueries({ queryKey: tweetKeys.all });
          toast.success("Your post is out there");
        }}
      />
    </div>
  );
}
export function UserTweets({
  userId,
  compose = false,
}: {
  userId: string;
  compose?: boolean;
}) {
  const query = useQuery({
    queryKey: tweetKeys.user(userId),
    queryFn: async ({ signal }) =>
      (
        await get<{ tweets: Tweet[] }>(
          `/tweets/user/${userId}`,
          undefined,
          signal
        )
      ).tweets,
  });
  return (
    <div className="max-w-3xl">
      {compose && <Composer />}
      {query.isPending ? (
        <div aria-label="Loading posts" role="status" className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-40" />
          ))}
        </div>
      ) : query.error ? (
        <ErrorState error={query.error} retry={() => query.refetch()} />
      ) : query.data?.length ? (
        query.data.map((tweet) => <TweetCard key={tweet._id} tweet={tweet} />)
      ) : (
        <EmptyState
          title="The conversation is just beginning"
          description="This channel hasn’t shared any community posts yet."
        />
      )}
    </div>
  );
}
