"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Compass,
  Users,
  History,
  ThumbsUp,
  ListVideo,
  MessageSquare,
  LayoutDashboard,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";

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
