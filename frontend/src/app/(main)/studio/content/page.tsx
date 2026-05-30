import Link from "next/link";
import { Upload } from "lucide-react";
import { ContentTable } from "@/features/studio/content-table";
import { PageHeading } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Your content" };
export default function ContentPage() {
  return (
    <>
      <PageHeading
        eyebrow="Creator Studio"
        title="Your body of work"
        description="Every story you’ve shared, with room for what comes next."
      >
        <Button asChild>
          <Link href="/studio/upload">
            <Upload />
            Upload video
          </Link>
        </Button>
      </PageHeading>
      <ContentTable />
    </>
  );
}
