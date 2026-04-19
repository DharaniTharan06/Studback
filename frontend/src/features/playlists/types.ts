import type { User } from "@/features/auth/types";
import type { Video } from "@/features/videos/types";
export interface Playlist {
  _id: string;
  name: string;
  description: string;
  owner: User | string | null;
  videos: (Video | string | null)[];
  createdAt?: string;
}
