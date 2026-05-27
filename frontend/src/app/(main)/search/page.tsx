import { Suspense } from "react";
import { SearchView } from "@/features/search/search-view";
import { VideoSkeletons } from "@/components/shared/states";
export const metadata = { title: "Search" };
export default function SearchPage() {
  return (
    <div className="page-wrap">
      <Suspense fallback={<VideoSkeletons />}>
        <SearchView />
      </Suspense>
    </div>
  );
}
