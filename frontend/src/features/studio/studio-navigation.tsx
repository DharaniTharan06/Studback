"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
export function StudioNavigation() {
  const path = usePathname();
  return (
    <nav aria-label="Creator Studio" className="flex flex-wrap gap-1">
      {[
        ["/studio", "Overview"],
        ["/studio/content", "Content"],
        ["/studio/audience", "Audience"],
        ["/studio/upload", "Upload"],
      ].map(([href, label]) => (
        <Link
          key={href}
          href={href}
          aria-current={path === href ? "page" : undefined}
          className={cn(
            "rounded-lg px-4 py-2.5 text-xs font-medium",
            path === href
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
