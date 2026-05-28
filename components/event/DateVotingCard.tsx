"use client";

import { useOptimistic, useTransition } from "react";
import { formatDayShort, formatMonthShort, formatTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";

type VoteStatus = "yes" | "maybe" | "no" | null;

interface DateVotingCardProps {
  proposedDateId: string;
  dateTime: Date;
  yesCount: number;
  maybeCount: number;
  noCount: number;
  totalInvited: number;
  myVote: VoteStatus;
  isBest: boolean;
  onVote: (proposedDateId: string, status: VoteStatus) => Promise<void>;
}

const VOTE_OPTIONS: { value: VoteStatus; label: string; color: string; activeColor: string }[] = [
  { value: "yes", label: "Oui", color: "border-border text-foreground/70", activeColor: "bg-[#6FBF7E] border-[#6FBF7E] text-white" },
  { value: "maybe", label: "Peut-être", color: "border-border text-foreground/70", activeColor: "bg-[#E8B547] border-[#E8B547] text-white" },
  { value: "no", label: "Non", color: "border-border text-foreground/70", activeColor: "bg-[#D96A7F] border-[#D96A7F] text-white" },
];

export function DateVotingCard({
  proposedDateId,
  dateTime,
  yesCount,
  maybeCount,
  noCount,
  totalInvited,
  myVote,
  isBest,
  onVote,
}: DateVotingCardProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticVote, setOptimisticVote] = useOptimistic(myVote);

  const answered = yesCount + maybeCount + noCount;
  const total = totalInvited || Math.max(answered, 1);

  const yesW = (yesCount / total) * 100;
  const maybeW = (maybeCount / total) * 100;
  const noW = (noCount / total) * 100;

  function handleVote(status: VoteStatus) {
    const next = optimisticVote === status ? null : status;
    startTransition(async () => {
      setOptimisticVote(next);
      await onVote(proposedDateId, next);
    });
  }

  const dayShort = formatDayShort(dateTime).toUpperCase();
  const day = dateTime.getDate();
  const month = formatMonthShort(dateTime);
  const time = formatTime(dateTime);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 transition-all",
        isBest && "border-primary/30 ring-1 ring-primary/20 bg-[#FEF5F2]"
      )}
    >
      {isBest && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-0.5">
            ✨ En tête
          </span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Date block */}
        <div className="flex flex-col items-center justify-start shrink-0 min-w-[48px]">
          <span className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
            {dayShort}
          </span>
          <span className="font-serif text-3xl font-bold leading-none text-foreground">
            {day}
          </span>
          <span className="text-xs text-foreground/50">{month}</span>
          <span className="text-xs font-medium text-foreground/70 mt-1">{time}</span>
        </div>

        {/* Right content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-foreground/60">
                {yesCount}/{total} oui
              </span>
              {answered > 0 && (
                <span className="text-xs text-foreground/40">
                  {answered} réponse{answered !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden flex gap-px">
              {yesW > 0 && (
                <div
                  className="h-full rounded-full bg-[#6FBF7E] transition-all duration-300"
                  style={{ width: `${yesW}%` }}
                />
              )}
              {maybeW > 0 && (
                <div
                  className="h-full bg-[#E8B547] transition-all duration-300"
                  style={{ width: `${maybeW}%` }}
                />
              )}
              {noW > 0 && (
                <div
                  className="h-full rounded-full bg-[#D96A7F] transition-all duration-300"
                  style={{ width: `${noW}%` }}
                />
              )}
            </div>
          </div>

          {/* Vote buttons */}
          <div className="flex gap-2">
            {VOTE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleVote(opt.value)}
                disabled={isPending}
                className={cn(
                  "flex-1 py-2 rounded-xl border text-sm font-medium transition-all",
                  optimisticVote === opt.value ? opt.activeColor : opt.color,
                  "hover:bg-muted/60 active:scale-95"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
