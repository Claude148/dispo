"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Bell, Plus } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { cn } from "@/lib/utils";

interface SidebarEvent {
  slug: string;
  title: string;
  date: Date;
  color: string; // dot color
}

interface SidebarGroup {
  id: string;
  name: string;
  color: string;
  memberCount: number;
}

interface SidebarProps {
  user: { name: string; email: string; avatarColor?: string };
  upcomingEvents?: SidebarEvent[];
  groups?: SidebarGroup[];
}

const navItems = [
  { href: "/", label: "Accueil", Icon: Home },
  { href: "/events", label: "Mes événements", Icon: Calendar },
  { href: "/friends", label: "Amis", Icon: Users },
  { href: "/activity", label: "Activité", Icon: Bell },
];

export function Sidebar({ user, upcomingEvents = [], groups = [] }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r border-border bg-card shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <span className="font-serif text-xl font-bold text-foreground">d</span>
        <span className="font-serif text-xl font-bold text-primary">Dispo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Groups */}
        {groups.length > 0 && (
          <div className="pt-4">
            <p className="px-3 mb-1.5 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Groupes
            </p>
            {groups.map((g) => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
              >
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: g.color }}
                />
                <span className="flex-1 truncate">{g.name}</span>
                <span className="text-xs text-foreground/40">{g.memberCount}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Upcoming events */}
        {upcomingEvents.length > 0 && (
          <div className="pt-4">
            <p className="px-3 mb-1.5 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Événements
            </p>
            {upcomingEvents.map((e) => (
              <Link
                key={e.slug}
                href={`/events/${e.slug}`}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
              >
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: e.color }}
                />
                <span className="flex-1 truncate">{e.title}</span>
                <span className="text-xs text-foreground/40">
                  {e.date.getDate()}{" "}
                  {["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"][e.date.getMonth()]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* User + Create */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        <Link
          href="/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          <Plus className="size-4" />
          Nouvel événement
        </Link>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-muted transition-colors cursor-pointer">
          <UserAvatar name={user.name} avatarColor={user.avatarColor} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-foreground/50 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
