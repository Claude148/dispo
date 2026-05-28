import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { EventHeroCard } from "@/components/event/EventHeroCard";
import { AvatarStack } from "@/components/common/AvatarStack";
import { StatusPill } from "@/components/common/StatusPill";
import { computeScore, getBestDate } from "@/lib/scoring";
import { formatDayLong, formatMonthShort } from "@/lib/format-date";

const EVENT_TYPES = [
  { key: "diner", label: "Dîner", emoji: "🍕" },
  { key: "apero", label: "Apéro", emoji: "🥂" },
  { key: "brunch", label: "Brunch", emoji: "🥐" },
  { key: "bbq", label: "BBQ", emoji: "🔥" },
];

export default async function HomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true },
  });
  if (!user) redirect("/login");

  const firstName = user.name.split(" ")[0] || user.name;

  // Pending responses (events where user hasn't fully responded)
  const pendingCount = await db.event.count({
    where: {
      invitations: { some: { email: user.email, status: "pending" } },
    },
  });

  // Upcoming events (organized or invited)
  const events = await db.event.findMany({
    where: {
      OR: [
        { organizerId: user.id },
        { invitations: { some: { email: user.email } } },
      ],
      status: { not: "cancelled" },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      organizer: { select: { id: true, name: true, avatarColor: true } },
      proposedDates: {
        include: { responses: true },
        orderBy: { dateTime: "asc" },
      },
      confirmedDate: true,
      invitations: { select: { email: true, status: true } },
    },
  });

  // Find next confirmed event for hero card
  const nextConfirmed = events.find((e) => e.confirmedDate);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Bonjour, {firstName} 👋
        </h1>
        {pendingCount > 0 && (
          <p className="mt-1 text-sm text-foreground/60">
            {pendingCount} ami{pendingCount !== 1 ? "es" : ""} attendent ta réponse cette semaine.
          </p>
        )}
      </div>

      {/* Hero : meilleure date */}
      {nextConfirmed && (() => {
        const allResponses = nextConfirmed.proposedDates.flatMap((d) => d.responses);
        const invited = nextConfirmed.invitations.length || 1;
        const yesTotal = nextConfirmed.confirmedDate
          ? nextConfirmed.proposedDates
              .find((d) => d.id === nextConfirmed.confirmedDateId)
              ?.responses.filter((r) => r.status === "yes").length ?? 0
          : 0;

        const attendees = nextConfirmed.invitations.slice(0, 6).map((inv) => ({
          id: inv.email,
          name: inv.email.split("@")[0],
        }));

        return (
          <section>
            <EventHeroCard
              title={nextConfirmed.title}
              emoji={nextConfirmed.emoji}
              confirmedDate={nextConfirmed.confirmedDate!.dateTime}
              location={nextConfirmed.location}
              yesCount={yesTotal}
              totalCount={invited}
              attendees={attendees}
              variant="home"
            />
            <Link
              href={`/events/${nextConfirmed.slug}`}
              className="mt-3 flex items-center justify-end text-sm font-medium text-primary hover:underline"
            >
              Voir →
            </Link>
          </section>
        );
      })()}

      {/* Créer rapidement */}
      <section>
        <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">
          Créer rapidement
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {EVENT_TYPES.map(({ key, label, emoji }) => (
            <Link
              key={key}
              href={`/new?type=${key}`}
              className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-4 hover:bg-muted/60 hover:border-primary/20 transition-all active:scale-95"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-medium text-foreground/70">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* À venir */}
      {events.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">
            À venir
          </h2>
          <div className="space-y-2">
            {events.map((event) => {
              const targetDate =
                event.confirmedDate ??
                (() => {
                  const scores = event.proposedDates.map((d) => {
                    const yes = d.responses.filter((r) => r.status === "yes").length;
                    const maybe = d.responses.filter((r) => r.status === "maybe").length;
                    const total = event.invitations.length || d.responses.length || 1;
                    return {
                      proposedDateId: d.id,
                      yes,
                      maybe,
                      no: d.responses.filter((r) => r.status === "no").length,
                      pending: total - d.responses.length,
                      total,
                      score: computeScore(yes, maybe, total),
                    };
                  });
                  const best = getBestDate(scores);
                  return best
                    ? event.proposedDates.find((d) => d.id === best.proposedDateId) ?? null
                    : null;
                })();

              const pending = event.invitations.filter((i) => i.status === "pending").length;
              const attendees = event.invitations.slice(0, 4).map((inv) => ({
                id: inv.email,
                name: inv.email.split("@")[0],
              }));

              return (
                <Link
                  key={event.slug}
                  href={`/events/${event.slug}`}
                  className="flex items-center gap-4 bg-card border border-border rounded-2xl px-4 py-3.5 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {event.title} {event.emoji}
                    </p>
                    {targetDate && (
                      <p className="text-sm text-foreground/60 mt-0.5">
                        {formatDayLong(targetDate.dateTime)}{" "}
                        {targetDate.dateTime.getDate()}{" "}
                        {formatMonthShort(targetDate.dateTime)}
                        {" · "}
                        {targetDate.dateTime.getHours()}h
                        {String(targetDate.dateTime.getMinutes()).padStart(2, "0")}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {attendees.length > 0 && <AvatarStack people={attendees} max={3} />}
                      {pending > 0 && (
                        <StatusPill variant="pending">
                          En attente · {pending}
                        </StatusPill>
                      )}
                    </div>
                  </div>
                  <span className="text-foreground/30 text-lg">›</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {events.length === 0 && !nextConfirmed && (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">🎉</p>
          <p className="font-medium text-foreground/70">Aucun événement pour l'instant</p>
          <Link
            href="/new"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Créer un événement
          </Link>
        </div>
      )}
    </div>
  );
}
