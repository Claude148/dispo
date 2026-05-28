"use client";

import { useState, useTransition } from "react";
import { confirmDate } from "@/actions/events";
import { formatDayShort, formatMonthShort, formatTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ConfirmDate {
  id: string;
  dateTime: Date;
  score: number;
  yesCount: number;
  total: number;
  isBest: boolean;
}

interface ConfirmDateSectionProps {
  eventSlug: string;
  dates: ConfirmDate[];
}

export function ConfirmDateSection({ eventSlug, dates }: ConfirmDateSectionProps) {
  const [selected, setSelected] = useState<string | null>(
    dates.find((d) => d.isBest)?.id ?? null
  );
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!selected) return;
    startTransition(async () => {
      await confirmDate(eventSlug, selected);
      toast.success("Date confirmée ! Les invités seront notifiés.");
    });
  }

  return (
    <section className="bg-card rounded-3xl border border-border p-6">
      <h2 className="font-serif text-lg font-bold text-foreground mb-1">Confirmer une date</h2>
      <p className="text-xs text-foreground/50 mb-5">
        Sélectionne la date à confirmer pour tous les participants.
      </p>

      <div className="space-y-2 mb-5">
        {[...dates].sort((a, b) => b.score - a.score).map((d) => (
          <button
            key={d.id}
            onClick={() => setSelected(d.id)}
            className={cn(
              "w-full flex items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all",
              selected === d.id
                ? "border-primary/40 bg-[#FEF5F2] ring-1 ring-primary/20"
                : "border-border bg-background hover:bg-muted/50"
            )}
          >
            <div className="flex flex-col items-center min-w-[44px]">
              <span className="text-xs text-foreground/50 uppercase">{formatDayShort(d.dateTime)}</span>
              <span className="font-serif text-2xl font-bold">{d.dateTime.getDate()}</span>
              <span className="text-xs text-foreground/50">{formatMonthShort(d.dateTime)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{formatTime(d.dateTime)}</span>
                {d.isBest && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                    ✨ Meilleure
                  </span>
                )}
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#6FBF7E] transition-all"
                  style={{ width: `${(d.yesCount / d.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-foreground/50 mt-1">
                {d.yesCount}/{d.total} oui · score {d.score}/100
              </p>
            </div>
            <div
              className={cn(
                "size-5 rounded-full border-2 shrink-0 transition-all",
                selected === d.id ? "border-primary bg-primary" : "border-border"
              )}
            />
          </button>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selected || isPending}
        className="w-full py-3 rounded-xl bg-foreground text-background font-medium text-sm hover:bg-foreground/90 transition-all disabled:opacity-50"
      >
        {isPending ? "Confirmation..." : "Confirmer cette date"}
      </button>
    </section>
  );
}
