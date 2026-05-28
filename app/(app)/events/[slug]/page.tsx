import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { computeScore, getBestDate } from "@/lib/scoring";
import { EventHeroCard } from "@/components/event/EventHeroCard";
import { AvailabilityMatrix } from "@/components/event/AvailabilityMatrix";
import { ParticipantList } from "@/components/event/ParticipantList";
import { ConfirmDateSection } from "./ConfirmDateSection";
import { ShareButton } from "./ShareButton";

type Props = { params: Promise<{ slug: string }> };

export default async function EventDashboardPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

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
      invitations: { select: { id: true, email: true, status: true } },
    },
  });

  if (!event) notFound();

  const isOrganizer = event.organizerId === session.user.id;

  // Compute scores
  const totalInvited = event.invitations.length || 1;
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
  const heroDate = event.confirmedDate ?? (bestDate
    ? event.proposedDates.find((d) => d.id === bestDate.proposedDateId)
    : event.proposedDates[0]);

  const heroYes = heroDate
    ? dateScores.find((s) => s.proposedDateId === heroDate.id)?.yes ?? 0
    : 0;

  const overallScore = bestDate?.score ?? 0;

  // Build availability matrix
  const matrixDates = event.proposedDates.map((d) => ({
    id: d.id,
    dateTime: d.dateTime,
    isBest: d.id === bestDate?.proposedDateId,
  }));

  // Collect all participants who responded
  const respondentMap = new Map<string, { id: string; name: string; avatarColor?: string; responses: Record<string, "yes" | "maybe" | "no"> }>();

  for (const d of event.proposedDates) {
    for (const r of d.responses) {
      const existing = respondentMap.get(r.userId) ?? {
        id: r.userId,
        name: r.user.name,
        avatarColor: r.user.avatarColor,
        responses: {},
      };
      existing.responses[d.id] = r.status as "yes" | "maybe" | "no";
      respondentMap.set(r.userId, existing);
    }
  }

  const matrixParticipants = Array.from(respondentMap.values());

  // Participants list (all invited + responded)
  const allEmails = new Set(event.invitations.map((i) => i.email));
  const participantsList = event.invitations.map((inv) => {
    const responded = respondentMap.values().next; // crude check
    const hasResponse = matrixParticipants.some((p) =>
      event.invitations.find((i) => i.email === inv.email) !== undefined
    );
    return {
      id: inv.id,
      name: inv.email.split("@")[0],
      status: (inv.status === "accepted" ? "responded" : "pending") as "responded" | "pending",
      statusLabel: inv.status === "pending" ? "Pas encore répondu" : "A répondu",
    };
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const shareUrl = `${appUrl}/e/${slug}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-foreground/40 font-medium uppercase tracking-wider mb-1">
            {event.status === "confirmed" ? "✅ Confirmé" : "En cours"}
          </p>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {event.title} {event.emoji}
          </h1>
          {event.location && (
            <p className="text-sm text-foreground/60 mt-1">{event.location}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShareButton url={shareUrl} />
        </div>
      </div>

      {/* Hero Card */}
      {heroDate && (
        <EventHeroCard
          title={event.title}
          emoji={event.emoji}
          confirmedDate={heroDate.dateTime}
          location={event.location}
          score={overallScore}
          yesCount={heroYes}
          totalCount={totalInvited}
          variant="dashboard"
        />
      )}

      {/* Matrice de disponibilités */}
      <section className="bg-card rounded-3xl border border-border p-6">
        <h2 className="font-serif text-lg font-bold text-foreground mb-1">Qui est dispo ?</h2>
        <p className="text-xs text-foreground/50 mb-5">
          {matrixParticipants.length}/{totalInvited} réponse
          {matrixParticipants.length !== 1 ? "s" : ""}
        </p>
        {matrixDates.length > 0 ? (
          <AvailabilityMatrix dates={matrixDates} participants={matrixParticipants} />
        ) : (
          <p className="text-sm text-foreground/50">Aucune date proposée.</p>
        )}
      </section>

      {/* Confirmer une date (organisateur uniquement) */}
      {isOrganizer && event.status !== "confirmed" && dateScores.length > 0 && (
        <ConfirmDateSection
          eventSlug={slug}
          dates={event.proposedDates.map((d) => ({
            id: d.id,
            dateTime: d.dateTime,
            score: dateScores.find((s) => s.proposedDateId === d.id)?.score ?? 0,
            yesCount: dateScores.find((s) => s.proposedDateId === d.id)?.yes ?? 0,
            total: totalInvited,
            isBest: d.id === bestDate?.proposedDateId,
          }))}
        />
      )}

      {/* Liste des participants */}
      {participantsList.length > 0 && (
        <section className="bg-card rounded-3xl border border-border p-6">
          <h2 className="font-serif text-lg font-bold text-foreground mb-4">
            Participants · {event.invitations.length}
          </h2>
          <ParticipantList participants={participantsList} />
        </section>
      )}
    </div>
  );
}
