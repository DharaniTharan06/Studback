import Link from "next/link";
import { AuthGuard } from "@/features/auth/guard";
import { StudioNavigation } from "@/features/studio/studio-navigation";
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-wrap">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <StudioNavigation />
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-primary"
        >
          Back to watching ↗
        </Link>
      </div>
      <AuthGuard>{children}</AuthGuard>
    </div>
  );
}
