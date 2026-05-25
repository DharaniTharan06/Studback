import { Library } from "@/features/videos/library";
import { AuthGuard } from "@/features/auth/guard";
export const metadata = { title: "Watch history" };
export default function HistoryPage() {
  return (
    <div className="page-wrap">
      <AuthGuard>
        <Library kind="history" />
      </AuthGuard>
    </div>
  );
}
