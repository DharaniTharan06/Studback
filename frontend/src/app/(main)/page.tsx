import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Feed } from "@/features/videos/feed";
import { AuthGuard } from "@/features/auth/guard";
import { Button } from "@/components/ui/button";
export default function HomePage() {
  return (
    <div className="page-wrap">
      <section className="ambient mb-8 flex flex-wrap items-center justify-between gap-5 rounded-xl border px-7 py-8">
        <div>
          <p className="eyebrow mb-3 flex items-center gap-2">
            <Sparkles className="size-3.5 text-primary" />
            Stay curious
          </p>
          <h1 className="text-3xl font-semibold tracking-[-.04em] md:text-[38px]">
            Find your next rabbit hole.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            Fresh perspectives. Stories worth staying for.
            <br className="hidden md:block" /> And creators who see the world a
            little differently.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/studio/upload">
            Share your perspective
            <ArrowUpRight />
          </Link>
        </Button>
      </section>
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          Your daily discovery
        </h2>
        <span className="eyebrow hidden sm:block">
          Good things are worth watching
        </span>
      </div>
      <AuthGuard>
        <Feed />
      </AuthGuard>
    </div>
  );
}
