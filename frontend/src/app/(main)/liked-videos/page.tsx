import { Library } from "@/features/videos/library";
import { AuthGuard } from "@/features/auth/guard";
export const metadata = { title: "Liked videos" };
export default function LikedPage() {
  return (
    <div className="page-wrap">
      <AuthGuard>
        <Library kind="liked-videos" />
      </AuthGuard>
    </div>
  );
}
