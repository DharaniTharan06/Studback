"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Compass,
  Users,
  History,
  ThumbsUp,
  ListVideo,
  MessageSquare,
  LayoutDashboard,
  Settings,
  Menu,
  Search,
} from "lucide-react";

import { useUser } from "@/features/auth/queries";

import { cn } from "@/lib/utils";
import { Brand } from "./brand";

import { Button } from "@/components/ui/button";

const navigation = [
  { href: "/", label: "Discover", icon: Compass, section: "Explore" },
  { href: "/subscriptions", label: "Subscriptions", icon: Users },
  { href: "/tweets", label: "Community", icon: MessageSquare },
  {
    href: "/history",
    label: "Watch history",
    icon: History,
    section: "Your collection",
  },
  { href: "/liked-videos", label: "Liked videos", icon: ThumbsUp },
  { href: "/playlists", label: "Playlists", icon: ListVideo },
  {
    href: "/studio",
    label: "Creator Studio",
    icon: LayoutDashboard,
    section: "Create",
  },
  { href: "/settings", label: "Settings", icon: Settings },
];
function Navigation({
  compact,
  close,
}: {
  compact?: boolean;
  close?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-1">
      {navigation.map(({ href, label, icon: Icon, section }, index) => (
        <div key={href}>
          {section && (
            <p
              className={cn(
                "eyebrow mb-2 px-3",
                index > 0 && "mt-5",
                compact && "sr-only"
              )}
            >
              {section}
            </p>
          )}
          <Link
            href={href}
            onClick={close}
            title={compact ? label : undefined}
            aria-label={compact ? label : undefined}
            aria-current={
              pathname === href ||
              (href !== "/" && pathname.startsWith(`${href}/`))
                ? "page"
                : undefined
            }
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground",
              compact && "justify-center px-0"
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            {!compact && label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useUser();
  const [compact, setCompact] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const search = useRef<HTMLInputElement>(null);
  const navigationTrigger = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const client = useQueryClient();
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        search.current?.focus();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);
  return (
    <>
      <a
        href="#main-content"
        className="sr-only fixed top-2 left-2 z-[100] rounded-lg bg-primary p-3 text-primary-foreground focus:not-sr-only"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 flex h-[72px] items-center gap-2 border-b bg-background/95 px-3 backdrop-blur-md sm:gap-5 sm:px-5 md:px-7">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open navigation"
          aria-expanded={drawer}
          aria-controls="mobile-navigation-sheet"
          ref={navigationTrigger}
          onClick={() => setDrawer(true)}
        >
          <Menu />
        </Button>
        <div className="shrink-0 md:w-[190px]">
          <Brand />
        </div>
        <form
          className="mx-auto hidden w-full max-w-xl sm:block"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            if (query.trim())
              router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          }}
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 size-4 text-muted-foreground" />
            <input
              ref={search}
              aria-label="Search videos"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="A little curiosity goes a long way…"
              className="h-10 w-full rounded-lg border bg-surface pl-11 pr-4 text-sm"
            />
          </div>
        </form>
      </header>
      <main
        id="main-content"
        className={cn(
          "min-h-[calc(100dvh-72px)]",
          compact ? "md:ml-[76px]" : "md:ml-[224px]"
        )}
      >
        {children}
      </main>
    </>
  );
}
