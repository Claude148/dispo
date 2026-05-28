"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/slug";
import { getAvatarColorIndex } from "@/lib/avatar-colors";

const createEventSchema = z.object({
  title: z.string().min(1, "Titre requis").max(100),
  emoji: z.string().max(8).optional(),
  type: z.enum(["diner", "apero", "brunch", "bbq", "autre"]),
  location: z.string().max(200).optional(),
  locationAddress: z.string().max(300).optional(),
  dates: z.array(z.string()).min(1, "Au moins une date requise"),
  times: z.array(z.string()),
  inviteEmails: z.array(z.string().email()).optional(),
});

export async function createEvent(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const rawDates = formData.getAll("dates") as string[];
  const rawTimes = formData.getAll("times") as string[];
  const rawEmails = (formData.get("inviteEmails") as string | null)
    ?.split(",")
    .map((e) => e.trim())
    .filter(Boolean) ?? [];

  const parsed = createEventSchema.safeParse({
    title: formData.get("title"),
    emoji: formData.get("emoji") || undefined,
    type: formData.get("type"),
    location: formData.get("location") || undefined,
    locationAddress: formData.get("locationAddress") || undefined,
    dates: rawDates,
    times: rawTimes,
    inviteEmails: rawEmails.length ? rawEmails : undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Données invalides");
  }

  const data = parsed.data;

  // Build datetime objects
  const proposedDateTimes = data.dates.map((dateStr, i) => {
    const time = data.times[i] ?? defaultTime(data.type);
    return new Date(`${dateStr}T${time}:00`);
  });

  // Generate unique slug
  let slug = generateSlug();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await db.event.findUnique({ where: { slug } });
    if (!existing) break;
    slug = generateSlug();
    attempts++;
  }

  const event = await db.event.create({
    data: {
      slug,
      title: data.title,
      emoji: data.emoji,
      type: data.type,
      location: data.location,
      locationAddress: data.locationAddress,
      organizerId: session.user.id,
      proposedDates: {
        create: proposedDateTimes.map((dt) => ({ dateTime: dt })),
      },
      invitations: data.inviteEmails?.length
        ? {
            create: data.inviteEmails.map((email) => ({
              email,
              token: generateSlug(24),
            })),
          }
        : undefined,
    },
  });

  redirect(`/events/${event.slug}`);
}

export async function confirmDate(eventSlug: string, proposedDateId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");

  const event = await db.event.findUnique({
    where: { slug: eventSlug },
    select: { id: true, organizerId: true },
  });

  if (!event || event.organizerId !== session.user.id) {
    throw new Error("Non autorisé");
  }

  await db.event.update({
    where: { id: event.id },
    data: {
      confirmedDateId: proposedDateId,
      status: "confirmed",
    },
  });

  revalidatePath(`/events/${eventSlug}`);
  revalidatePath("/");
}

function defaultTime(type: string): string {
  switch (type) {
    case "diner": return "20:00";
    case "apero": return "19:00";
    case "brunch": return "11:30";
    case "bbq": return "19:00";
    default: return "19:00";
  }
}
