"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createEvent } from "@/actions/events";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { key: "diner", label: "Dîner", emoji: "🍕" },
  { key: "apero", label: "Apéro", emoji: "🥂" },
  { key: "brunch", label: "Brunch", emoji: "🥐" },
  { key: "bbq", label: "BBQ", emoji: "🔥" },
  { key: "autre", label: "Autre", emoji: "✨" },
];

const DEFAULT_TIMES: Record<string, string> = {
  diner: "20:00",
  apero: "19:00",
  brunch: "11:30",
  bbq: "19:00",
  autre: "19:00",
};

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const MONTHS = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"];
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function NewEventPage() {
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get("type") ?? "diner") as string;

  const [type, setType] = useState(defaultType);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [times, setTimes] = useState<Record<string, string>>({});
  const [title, setTitle] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultTime = DEFAULT_TIMES[type] ?? "19:00";

  function toggleDate(dateStr: string) {
    setSelectedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  }

  function setDatetime(dateStr: string, time: string) {
    setTimes((prev) => ({ ...prev, [dateStr]: time }));
  }

  // Build a simple calendar for the next 6 weeks
  function buildCalendar() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weeks: { date: Date; str: string }[][] = [];
    const start = new Date(today);
    // Start from Monday of current week
    const dow = start.getDay();
    start.setDate(start.getDate() - (dow === 0 ? 6 : dow - 1));

    for (let w = 0; w < 7; w++) {
      const week: { date: Date; str: string }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        // Use local date parts to avoid UTC timezone shift
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const str = `${y}-${m}-${day}`;
        week.push({ date, str });
      }
      weeks.push(week);
    }
    return weeks;
  }

  const weeks = buildCalendar();
  const today = getTodayStr();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedDates.length === 0) {
      setError("Sélectionne au moins une date.");
      return;
    }
    setError(null);
    setIsPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      // Remove dates from native formdata, add manually ordered
      selectedDates.forEach((d) => formData.append("dates", d));
      selectedDates.forEach((d) => formData.append("times", times[d] ?? defaultTime));
      formData.set("type", type);
      await createEvent(formData);
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
        setError(err.message);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="font-serif text-2xl font-bold text-foreground">Nouvel événement</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Titre */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
            Quel événement ?
          </label>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dîner chez Simon 🍕"
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 font-serif text-lg"
          />
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/40 uppercase tracking-wider block">
            Type
          </label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map(({ key, label, emoji }) => (
              <button
                key={key}
                type="button"
                onClick={() => setType(key)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all",
                  type === key
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border text-foreground/70 hover:bg-muted"
                )}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lieu */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/40 uppercase tracking-wider block">
            Où ?
          </label>
          <input
            name="location"
            placeholder="Chez Simon"
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            name="locationAddress"
            placeholder="12 rue de Charonne, Paris 11°"
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
        </div>

        {/* Calendrier */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Proposer des dates
            </label>
            <span className="text-xs text-foreground/50">
              {selectedDates.length} sélectionnée{selectedDates.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            {/* Days header */}
            <div className="grid grid-cols-7 mb-2">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                <div key={i} className="text-center text-xs font-medium text-foreground/40 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map(({ date, str }) => {
                  const isPast = str < today;
                  const isSelected = selectedDates.includes(str);
                  return (
                    <button
                      key={str}
                      type="button"
                      disabled={isPast}
                      onClick={() => !isPast && toggleDate(str)}
                      className={cn(
                        "aspect-square flex items-center justify-center text-sm rounded-full m-0.5 transition-all font-medium",
                        isPast && "text-foreground/20 cursor-not-allowed",
                        !isPast && !isSelected && "hover:bg-muted text-foreground",
                        isSelected && "bg-primary text-white",
                        str === today && !isSelected && "ring-1 ring-primary text-primary"
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="flex gap-4 mt-3 justify-end">
              <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                <span className="size-3 rounded-full bg-primary inline-block" />
                Proposée
              </div>
            </div>
          </div>

          {/* Selected dates with time pickers */}
          {selectedDates.length > 0 && (
            <div className="space-y-2">
              {[...selectedDates].sort().map((dateStr) => (
                <div
                  key={dateStr}
                  className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-2.5"
                >
                  <span className="text-sm font-medium text-foreground">
                    {getDateLabel(dateStr)}
                  </span>
                  <input
                    type="time"
                    value={times[dateStr] ?? defaultTime}
                    onChange={(e) => setDatetime(dateStr, e.target.value)}
                    className="text-sm border-none bg-transparent focus:outline-none text-foreground/70"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inviter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground/40 uppercase tracking-wider block">
            Inviter par email
          </label>
          <textarea
            name="inviteEmails"
            placeholder="camille@example.fr, hugo@example.fr, ..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
          />
          <p className="text-xs text-foreground/40">Sépare les adresses par des virgules.</p>
        </div>

        {error && (
          <p className="text-sm text-danger font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 rounded-xl bg-foreground text-background font-medium text-sm hover:bg-foreground/90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isPending ? "Création..." : "✈️ Envoyer aux amis"}
        </button>
      </form>
    </div>
  );
}
