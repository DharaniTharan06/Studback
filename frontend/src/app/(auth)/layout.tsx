import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ArrowUpRight, Play, MessageSquare, Users } from "lucide-react";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <header className="flex h-20 items-center justify-between px-6 md:px-12">
        <Brand />
        <ThemeToggle />
      </header>
      <main className="mx-auto grid min-h-[calc(100dvh-80px)] max-w-7xl grid-cols-1 items-center gap-16 px-6 py-10 lg:grid-cols-2 lg:px-12">
        <section className="hidden lg:block">
          <p className="eyebrow mb-6">Watch · Create · Connect</p>
          <h2 className="max-w-lg text-6xl leading-[1.08] font-semibold tracking-[-.055em]">
            A world of ideas.
            <br />
            <span className="text-primary">A place for yours.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground">
            For the stories you want to tell, the things you want to learn, and
            the people you haven’t met yet.
          </p>
          <div className="ambient mt-12 grid grid-cols-3 gap-3 rounded-xl border p-5">
            {[
              [Play, "Worth watching"],
              [MessageSquare, "Keep talking"],
              [Users, "Find your people"],
            ].map(([Icon, label]) => {
              const ItemIcon = Icon as typeof Play;
              return (
                <div key={String(label)} className="py-4">
                  <ItemIcon className="mb-4 size-5 text-primary" />
                  <p className="text-xs font-medium">{String(label)}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            Curiosity looks good on you.
            <ArrowUpRight className="size-3.5" />
          </p>
        </section>
        <section className="mx-auto w-full max-w-[420px]">{children}</section>
      </main>
    </div>
  );
}
