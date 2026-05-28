"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const voteSchema = z.object({
  eventId: z.string(),
  proposedDateId: z.string(),
  status: z.enum(["yes", "maybe", "no"]).nullable(),
});

export async function castVote(
  eventId: string,
  proposedDateId: string,
  status: "yes" | "maybe" | "no" | null
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const parsed = voteSchema.safeParse({ eventId, proposedDateId, status });
  if (!parsed.success) throw new Error("Données invalides");

  if (status === null) {
    await db.response.deleteMany({
      where: { userId: session.user.id, proposedDateId },
    });
  } else {
    await db.response.upsert({
      where: { userId_proposedDateId: { userId: session.user.id, proposedDateId } },
      create: {
        userId: session.user.id,
        eventId,
        proposedDateId,
        status,
      },
      update: { status },
    });
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { slug: true },
  });

  if (event) {
    revalidatePath(`/events/${event.slug}`);
    revalidatePath(`/e/${event.slug}`);
    revalidatePath("/");
  }
}

// Vote for public guest (by email without full account)
export async function castGuestVote(
  eventId: string,
  proposedDateId: string,
  status: "yes" | "maybe" | "no" | null,
  guestEmail: string
) {
  // Find or create user by email
  let user = await db.user.findUnique({ where: { email: guestEmail } });
  if (!user) {
    const colors = ["0", "1", "2", "3", "4", "5", "6", "7"];
    const colorIdx = colors[Math.floor(Math.random() * colors.length)];
    user = await db.user.create({
      data: {
        email: guestEmail,
        name: guestEmail.split("@")[0],
        avatarColor: colorIdx,
      },
    });
  }

  if (status === null) {
    await db.response.deleteMany({
      where: { userId: user.id, proposedDateId },
    });
  } else {
    await db.response.upsert({
      where: { userId_proposedDateId: { userId: user.id, proposedDateId } },
      create: { userId: user.id, eventId, proposedDateId, status },
      update: { status },
    });
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { slug: true },
  });

  if (event) {
    revalidatePath(`/e/${event.slug}`);
    revalidatePath(`/events/${event.slug}`);
  }
}
