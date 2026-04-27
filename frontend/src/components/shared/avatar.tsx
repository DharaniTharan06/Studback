import Image from "next/image";
import { cn, safeMediaUrl } from "@/lib/utils";
export function Avatar({
  src,
  name = "Creator",
  className,
}: {
  src?: string;
  name?: string;
  className?: string;
}) {
  const url = safeMediaUrl(src);
  return (
    <span
      className={cn(
        "relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-semibold text-accent-foreground",
        className
      )}
    >
      {url ? (
        <Image
          src={url}
          alt={`${name} avatar`}
          fill
          sizes="96px"
          className="object-cover"
        />
      ) : (
        name.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}
