"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { post } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { channelKeys, type Channel } from "@/features/channels/queries";
import { subscriptionKeys } from "./queries";
export function SubscribeButton({ channel }: { channel: Channel }) {
  const client = useQueryClient();
  const key = channelKeys.detail(channel.username);
  const mutation = useMutation({
    mutationFn: () =>
      post<{ subscribed: boolean }>(`/subscriptions/c/${channel._id}`),
    onMutate: async () => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Channel>(key);
      client.setQueryData<Channel>(key, (current) =>
        current
          ? {
              ...current,
              isSubscribed: !current.isSubscribed,
              subscribersCount: Math.max(
                0,
                current.subscribersCount + (current.isSubscribed ? -1 : 1)
              ),
            }
          : current
      );
      return { previous };
    },
    onError: (error, _, context) => {
      client.setQueryData(key, context?.previous);
      toast.error(error.message);
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: key });
      client.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
  return (
    <Button
      variant={channel.isSubscribed ? "secondary" : "default"}
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
      aria-pressed={channel.isSubscribed}
    >
      {channel.isSubscribed ? <Check /> : <Plus />}
      {channel.isSubscribed ? "Subscribed" : "Subscribe"}
    </Button>
  );
}
