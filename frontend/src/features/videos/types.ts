import type { User } from "@/features/auth/types";
export interface Video {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  videofile?: string;
  duration?: number;
  views?: number;
  ispublished?: boolean;
  owner?: User | string | null;
  createdAt?: string;
}
export interface Paginated<T> {
  docs: T[];
  totalDocs: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  nextPage: number | null;
}
export function ownerId(owner?: User | string | null) {
  return typeof owner === "string" ? owner : owner?._id;
}
