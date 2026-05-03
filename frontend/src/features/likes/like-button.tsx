"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { get, post } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/features/auth/queries";
export const likeKeys = {
  all: ["likes"] as const,
  list: (kind: string) => ["likes", kind] as const,
};
type Kind = "videos" | "comments" | "tweets";
interface Like {
  video?: { _id: string } | null;
  comment?: { _id: string } | null;
  tweet?: { _id: string } | null;
}
export function LikeButton({
  id,
  kind,
  small = false,
}: {
  id: string;
  kind: Kind;
  small?: boolean;
}) {
  const client = useQueryClient();
  const { data: user } = useUser();
  const key = likeKeys.list(kind);
  const field = { videos: "video", comments: "comment", tweets: "tweet" }[
    kind
  ] as keyof Like;
  const likes = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) =>
      (
        await get<{ likes: Like[] }>(`/likes/${kind}`, undefined, signal)
      ).likes.flatMap((like) => (like[field]?._id ? [like[field]!._id] : [])),
    enabled: !!user,
  });
  const liked = likes.data?.includes(id) ?? false;
  const mutation = useMutation({
    mutationFn: () =>
      post<{ liked: boolean }>(
        `/likes/toggle/${{ videos: "v", comments: "c", tweets: "t" }[kind]}/${id}`
      ),
    onMutate: async () => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<string[]>(key);
      client.setQueryData<string[]>(key, (current) =>
        liked
          ? current?.filter((item) => item !== id)
          : [...(current ?? []), id]
      );
      return { previous };
    },
    onSuccess: (data) =>
      client.setQueryData<string[]>(key, (current) =>
        data.liked
          ? [...new Set([...(current ?? []), id])]
          : current?.filter((item) => item !== id)
      ),
    onError: (error, _, context) => {
      const wasLiked = context?.previous?.includes(id) ?? false;
      client.setQueryData<string[]>(key, (current) =>
        wasLiked
          ? [...new Set([...(current ?? []), id])]
          : current?.filter((item) => item !== id)
      );
      toast.error(error.message);
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: key });
      if (kind === "videos")
        client.invalidateQueries({ queryKey: ["library", "liked-videos"] });
    },
  });
  return (
    <Button
      variant={liked ? "default" : small ? "ghost" : "secondary"}
      size={small ? "sm" : "default"}
      aria-label={liked ? "Unlike" : "Like"}
      aria-pressed={liked}
      disabled={!user || likes.isPending || likes.isError || mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <ThumbsUp className={liked ? "fill-current" : ""} />
      {small ? null : liked ? "Liked" : "Like"}
    </Button>
  );
}
