import { VideoSkeletons } from "@/components/shared/states";
export default function Loading() {
  return (
    <div className="page-wrap">
      <div className="skeleton mb-8 h-8 w-48" />
      <VideoSkeletons />
    </div>
  );
}
