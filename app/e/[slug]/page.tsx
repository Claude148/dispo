import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeScore, getBestDate } from "@/lib/scoring";
import { GuestVotingView } from "./GuestVotingView";
import { formatDayLong, formatMonthLong, formatTime } from "@/lib/format-date";

type Props = { params: Promise<{ slug: string }> };

export default async function GuestEventPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const event = await db.event.findUnique({
    where: { slug },
    include: {
      organizer: { select: { id: true, name: true, avatarColor: true } },
      proposedDates: {
        include: {
          responses: {
            include: { user: { select: { id: true, name: true, avatarColor: true } } },
          },
        },
        orderBy: { dateTime: "asc" },
      },
      confirmedDate: true,
      invitations: { select: { email: true, status: true } },
    },
  });

  if (!event) notFound();

  const userId = session?.user?.id ?? null;
  const totalInvited = event.invitations.length || event.proposedDates.reduce(
    (max, d) => Math.max(max, d.responses.length),
    1
  );

  const dateScores = event.proposedDates.map((d) => {
    const yes = d.responses.filter((r) => r.status === "yes").length;
    const maybe = d.responses.filter((r) => r.status === "maybe").length;
    const no = d.responses.filter((r) => r.status === "no").length;
    return {
      proposedDateId: d.id,
      yes,
      maybe,
      no,
      pending: totalInvited - d.responses.length,
      total: totalInvited,
      score: computeScore(yes, maybe, totalInvited),
    };
  });

  const bestDate = getBestDate(dateScores);

  const datesWithVotes = event.proposedDates.map((d) => {
    const scoreData = dateScores.find((s) => s.proposedDateId === d.id)!;
    const myVote = userId
      ? (d.responses.find((r) => r.userId === userId)?.status as "yes" | "maybe" | "no" | null) ?? null
      : null;
    return {
      id: d.id,
      dateTime: d.dateTime,
      yesCount: scoreData.yes,
      maybeCount: scoreData.maybe,
      noCount: scoreData.no,
      totalInvited,
      myVote,
      isBest: d.id === bestDate?.proposedDateId,
    };
  });

  const answeredCount = event.proposedDates.reduce((max, d) => {
    const uniqueUsers = new Set(d.responses.map((r) => r.userId)).size;
    return Math.max(max, uniqueUsers);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-1">
            Invitation de {event.organizer.name.split(" ")[0]}
          </p>
          <h1 className="font-serif text-3xl font-bold text-foreground mt-3">
            Qui est <span className="text-primary">dispo</span> ?
          </h1>
          <p className="mt-2 text-foreground font-medium">
            {event.title} {event.emoji}
          </p>
          <p className="text-sm text-foreground/60 mt-1">
            Indique tes disponibilités d'un tap.
          </p>
        </div>

        {/* Confirmed badge */}
        {event.status === "confirmed" && event.confirmedDate && (
          <div className="rounded-3xl p-5 bg-gradient-to-br from-[#FCE8DC] to-[#F5D5C0] text-center">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              ✦ Meilleure date trouvée
            </p>
            <p className="font-serif text-5xl font-bold text-foreground">
              {event.confirmedDate.dateTime.getDate()}
            </p>
            <p className="font-serif text-xl font-medium text-foreground/80 mt-0.5">
              {formatDayLong(event.confirmedDate.dateTime)}{" "}
              {formatMonthLong(event.confirmedDate.dateTime)}
            </p>
            <p className="text-foreground/60 mt-1">{formatTime(event.confirmedDate.dateTime)}</p>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-foreground/50">
          <span>
            {answeredCount}/{totalInvited} ont répondu
          </span>
          {event.location && (
            <span>📍 {event.location}</span>
          )}
        </div>

        {/* Voting cards */}
        {event.status !== "confirmed" && (
          <GuestVotingView
            eventId={event.id}
            dates={datesWithVotes}
            currentUserId={userId}
            currentUserEmail={session?.user?.email ?? null}
          />
        )}

        {event.status === "confirmed" && (
          <div className="space-y-3">
            {datesWithVotes.map((d) => (
              <div
                key={d.id}
                className={`rounded-2xl border p-4 ${d.isBest ? "border-primary/30 bg-[#FEF5F2]" : "border-border bg-card"}`}
              >
                <div className="flex gap-4">
                  <div className="flex flex-col items-center min-w-[48px]">
                    <span className="text-xs text-foreground/50 uppercase">
                      {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][d.dateTime.getDay()]}
                    </span>
                    <span className="font-serif text-3xl font-bold">{d.dateTime.getDate()}</span>
                    <span className="text-xs text-foreground/50">
                      {["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"][d.dateTime.getMonth()]}
                    </span>
                    <span className="text-xs font-medium text-foreground/70 mt-1">
                      {d.dateTime.getHours()}h{String(d.dateTime.getMinutes()).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-foreground/60">{d.yesCount}/{d.totalInvited} oui</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden flex gap-px">
                      {d.yesCount > 0 && (
                        <div className="h-full rounded-full bg-[#6FBF7E]" style={{ width: `${(d.yesCount / d.totalInvited) * 100}%` }} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-xs text-foreground/30">Organisé par {event.organizer.name}</p>
        </div>
      </div>
    </div>
  );
}
