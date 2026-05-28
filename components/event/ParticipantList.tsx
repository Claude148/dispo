import { UserAvatar } from "@/components/common/UserAvatar";
import { StatusPill } from "@/components/common/StatusPill";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  avatarColor?: string;
  status: "responded" | "pending";
  statusLabel: string;
}

interface ParticipantListProps {
  participants: Participant[];
  className?: string;
}

export function ParticipantList({ participants, className }: ParticipantListProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {participants.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar name={p.name} avatarColor={p.avatarColor} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
            </div>
          </div>
          <StatusPill variant={p.status === "responded" ? "neutral" : "pending"}>
            {p.statusLabel}
          </StatusPill>
        </div>
      ))}
    </div>
  );
}
