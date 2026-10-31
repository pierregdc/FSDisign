import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { GitHubIcon } from "@/components/icons/github-icon";

export function OpenSourceLink({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <a
      href={SITE.githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Code source sur GitHub — licence MIT"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] text-faint transition-colors hover:bg-ink/[0.04] hover:text-ink",
        className
      )}
    >
      <GitHubIcon className="h-3.5 w-3.5" />
      {compact ? "Open source" : `Open source · ${SITE.license}`}
    </a>
  );
}
