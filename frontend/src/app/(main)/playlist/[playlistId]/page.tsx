import { PlaylistView } from "@/features/playlists/playlist-view";
import { AuthGuard } from "@/features/auth/guard";
export const metadata = { title: "Playlist" };
export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ playlistId: string }>;
}) {
  const { playlistId } = await params;
  return (
    <div className="page-wrap">
      <AuthGuard>
        <PlaylistView id={playlistId} />
      </AuthGuard>
    </div>
  );
}
