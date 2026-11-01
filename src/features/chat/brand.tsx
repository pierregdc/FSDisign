import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { box: "h-7 w-7", image: 28 },
  md: { box: "h-9 w-9", image: 36 },
  lg: { box: "h-16 w-16", image: 64 },
  xl: { box: "h-20 w-20", image: 80 },
} as const;

export function BrandMark({
  size = "md",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  const style = sizes[size];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        style.box,
        className
      )}
      aria-hidden="true"
    >
      <Image
        src="/france-student-mark.png"
        unoptimized
        alt=""
        width={style.image}
        height={style.image}
        priority={size === "lg" || size === "xl"}
        className="h-full w-full object-contain drop-shadow-[0_8px_18px_rgba(1,57,183,0.16)]"
      />
    </span>
  );
}

export function BrandName({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "text-[13px] font-extrabold uppercase leading-none tracking-[0.14em] text-ink",
        className
      )}
    >
      FranceStudent
    </span>
  );
}

export function BrandSubtitle({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "text-[9px] font-semibold uppercase tracking-[0.2em] text-accent",
        className
      )}
    >
      Studio UI Design
    </span>
  );
}
