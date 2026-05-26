import { PlaylistsView } from "@/features/playlists/playlist-list";
import { AuthGuard } from "@/features/auth/guard";
export const metadata = { title: "Playlists" };
export default function PlaylistsPage() {
  return (
    <div className="page-wrap">
      <AuthGuard>
        <PlaylistsView />
      </AuthGuard>
    </div>
  );
}
