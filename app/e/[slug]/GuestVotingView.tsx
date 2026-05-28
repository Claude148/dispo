"use client";

import { useState } from "react";
import { DateVotingCard } from "@/components/event/DateVotingCard";
import { castVote, castGuestVote } from "@/actions/responses";
import { toast } from "sonner";

interface VoteDate {
  id: string;
  dateTime: Date;
  yesCount: number;
  maybeCount: number;
  noCount: number;
  totalInvited: number;
  myVote: "yes" | "maybe" | "no" | null;
  isBest: boolean;
}

interface GuestVotingViewProps {
  eventId: string;
  dates: VoteDate[];
  currentUserId: string | null;
  currentUserEmail: string | null;
}

export function GuestVotingView({
  eventId,
  dates,
  currentUserId,
  currentUserEmail,
}: GuestVotingViewProps) {
  const [guestEmail, setGuestEmail] = useState(currentUserEmail ?? "");
  const [emailSubmitted, setEmailSubmitted] = useState(!!currentUserId || !!currentUserEmail);
  const [autoSaved, setAutoSaved] = useState(false);

  async function handleVote(proposedDateId: string, status: "yes" | "maybe" | "no" | null) {
    try {
      if (currentUserId) {
        await castVote(eventId, proposedDateId, status);
      } else if (guestEmail) {
        await castGuestVote(eventId, proposedDateId, status, guestEmail);
        if (!autoSaved) {
          setAutoSaved(true);
          toast.success("Réponse sauvegardée automatiquement ✓", { duration: 2000 });
        }
      }
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  }

  if (!emailSubmitted) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-medium text-foreground mb-1">Qui es-tu ?</h3>
          <p className="text-sm text-foreground/60 mb-4">
            Entre ton email pour que ta réponse soit sauvegardée.
          </p>
          <input
            type="email"
            placeholder="toi@exemple.fr"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 mb-3"
          />
          <button
            onClick={() => guestEmail && setEmailSubmitted(true)}
            disabled={!guestEmail}
            className="w-full py-3 rounded-xl bg-foreground text-background font-medium text-sm hover:bg-foreground/90 transition-all disabled:opacity-40"
          >
            Voir les dates →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {autoSaved && (
        <p className="text-xs text-center text-foreground/40">
          ✓ Auto-sauvegardé · {guestEmail}
        </p>
      )}
      {dates.map((d) => (
        <DateVotingCard
          key={d.id}
          proposedDateId={d.id}
          dateTime={d.dateTime}
          yesCount={d.yesCount}
          maybeCount={d.maybeCount}
          noCount={d.noCount}
          totalInvited={d.totalInvited}
          myVote={d.myVote}
          isBest={d.isBest}
          onVote={handleVote}
        />
      ))}
      <p className="text-xs text-center text-foreground/30 pt-2">
        ✓ Tes réponses sont sauvegardées automatiquement
      </p>
    </div>
  );
}
