"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { AuthGuard } from "@/features/auth/guard";
import { Feed } from "@/features/videos/feed";
import { PageHeading, EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
export function SearchView() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const [input, setInput] = useState(query);
  const router = useRouter();
  return (
    <>
      <PageHeading
        eyebrow="Explore something new"
        title={query ? `Results for “${query}”` : "Follow your curiosity"}
        description="Search video titles and descriptions."
      />
      <form
        className="mb-8 flex max-w-2xl gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          router.push(`/search?q=${encodeURIComponent(input.trim())}`);
        }}
      >
        <input
          aria-label="Search video titles and descriptions"
          className="input"
          placeholder="What’s on your mind?"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <Button type="submit" aria-label="Search">
          <Search />
        </Button>
      </form>
      <AuthGuard>
        {query ? (
          <Feed key={query} query={query} />
        ) : (
          <EmptyState
            title="There’s a story for every interest"
            description="Search for something you love, or something you’ve always wanted to learn."
          />
        )}
      </AuthGuard>
    </>
  );
}
