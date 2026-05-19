import Link from "next/link";
import Image from "next/image";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Studback home"
      className="inline-flex items-center gap-2.5"
    >
      <span className="flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
        <Image
          src="/brand/media-frames-light.svg"
          alt=""
          width={32}
          height={32}
          className="block dark:hidden"
          unoptimized
        />
        <Image
          src="/brand/media-frames-dark.svg"
          alt=""
          width={32}
          height={32}
          className="hidden dark:block"
          unoptimized
        />
      </span>
      {!compact && (
        <span className="hidden text-xl font-bold tracking-[-.055em] min-[360px]:inline">
          studback<span className="text-primary">.</span>
        </span>
      )}
    </Link>
  );
}
