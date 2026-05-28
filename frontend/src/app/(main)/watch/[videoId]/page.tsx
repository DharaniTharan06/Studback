import { Suspense } from "react";
import { WatchView } from "@/features/videos/watch-view";
import { AuthGuard } from "@/features/auth/guard";
import { VideoSkeletons } from "@/components/shared/states";
export const metadata = { title: "Watch" };
export default async function WatchPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  return (
    <div className="page-wrap">
      <AuthGuard>
        <Suspense fallback={<VideoSkeletons />}>
          <WatchView id={videoId} />
        </Suspense>
      </AuthGuard>
    </div>
  );
}
