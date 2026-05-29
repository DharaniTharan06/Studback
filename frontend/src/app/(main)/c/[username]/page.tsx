import { ChannelView } from "@/features/channels/channel-view";
import { AuthGuard } from "@/features/auth/guard";
export const metadata = { title: "Channel" };
export default async function ChannelPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return (
    <div className="page-wrap">
      <AuthGuard>
        <ChannelView username={username} />
      </AuthGuard>
    </div>
  );
}
