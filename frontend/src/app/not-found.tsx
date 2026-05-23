import Link from "next/link";
import { Brand } from "@/components/layout/brand";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5">
      <Brand />
      <p className="eyebrow mt-8">404 · Off the beaten path</p>
      <h1 className="text-3xl font-semibold">This page isn’t here.</h1>
      <p className="text-sm text-muted-foreground">
        There’s still plenty to discover.
      </p>
      <Button asChild>
        <Link href="/">Back to Studback</Link>
      </Button>
    </main>
  );
}
