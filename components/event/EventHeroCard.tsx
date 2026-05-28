import { AvatarStack } from "@/components/common/AvatarStack";
import { formatDayShort, formatMonthShort, formatTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";

interface Person {
  id: string;
  name: string;
  avatarColor?: string;
}

interface EventHeroCardProps {
  title: string;
  emoji?: string | null;
  confirmedDate: Date;
  location?: string | null;
  score?: number;
  yesCount?: number;
  totalCount?: number;
  attendees?: Person[];
  variant?: "home" | "dashboard";
  className?: string;
}

export function EventHeroCard({
  title,
  emoji,
  confirmedDate,
  location,
  score,
  yesCount,
  totalCount,
  attendees = [],
  variant = "home",
  className,
}: EventHeroCardProps) {
  const day = formatDayShort(confirmedDate).toUpperCase();
  const date = confirmedDate.getDate();
  const month = formatMonthShort(confirmedDate);
  const time = formatTime(confirmedDate);

  return (
    <div
      className={cn(
        "rounded-3xl p-5 relative overflow-hidden",
        "bg-gradient-to-br from-[#FCE8DC] to-[#F5D5C0]",
        className
      )}
    >
      {variant === "home" && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-primary text-xs">✦</span>
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            Meilleure date trouvée
          </span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Bloc date */}
        <div className="flex flex-col items-center justify-center bg-white/60 rounded-2xl px-3.5 py-2.5 shrink-0 min-w-[64px]">
          <span className="text-xs font-medium text-foreground/60 uppercase tracking-wider">
            {day}
          </span>
          <span className="font-serif text-5xl font-bold leading-none text-foreground">
            {date}
          </span>
          <span className="text-xs font-medium text-foreground/60">{month}</span>
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-xl font-bold leading-tight text-foreground">
            {title} {emoji}
          </h2>
          {location && (
            <p className="text-sm text-foreground/60 mt-0.5 truncate">{location}</p>
          )}
          <p className="text-sm text-foreground/70 mt-1">{time}</p>
          <div className="flex items-center gap-2 mt-3">
            {attendees.length > 0 && <AvatarStack people={attendees} max={3} />}
            {yesCount !== undefined && totalCount !== undefined && (
              <span className="text-xs text-foreground/60 font-medium">
                {yesCount} ami{yesCount !== 1 ? "es" : ""} disponible{yesCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Score (dashboard only) */}
        {variant === "dashboard" && score !== undefined && (
          <div className="flex flex-col items-end shrink-0">
            <span className="text-xs font-medium text-foreground/50 uppercase tracking-wide mb-1">
              Score dispo
            </span>
            <span className="font-serif text-4xl font-bold text-primary leading-none">
              {score}
            </span>
            <span className="text-xs text-foreground/50">/100</span>
            {yesCount !== undefined && totalCount !== undefined && (
              <span className="text-xs text-foreground/60 mt-1">
                {yesCount}/{totalCount} oui
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
