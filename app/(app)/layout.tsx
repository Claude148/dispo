import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, avatarColor: true },
  });

  if (!user) redirect("/login");

  const upcomingEvents = await db.event.findMany({
    where: {
      OR: [
        { organizerId: user.id },
        { invitations: { some: { email: user.email } } },
      ],
      status: { not: "cancelled" },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      slug: true,
      title: true,
      type: true,
      confirmedDate: { select: { dateTime: true } },
      proposedDates: { orderBy: { dateTime: "asc" }, take: 1 },
    },
  });

  const typeColors: Record<string, string> = {
    diner: "#E85D3B",
    apero: "#E8B547",
    brunch: "#6FBF7E",
    bbq: "#D96A7F",
    autre: "#7A6F66",
  };

  const sidebarEvents = upcomingEvents.map((e) => ({
    slug: e.slug,
    title: e.title,
    date: e.confirmedDate?.dateTime ?? e.proposedDates[0]?.dateTime ?? new Date(),
    color: typeColors[e.type] ?? "#7A6F66",
  }));

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop only */}
      <div className="hidden lg:flex">
        <Sidebar
          user={{ name: user.name, email: user.email, avatarColor: user.avatarColor }}
          upcomingEvents={sidebarEvents}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
