import { UserAvatar } from "@/components/common/UserAvatar";
import { formatDayShort, formatMonthShort, formatTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";

type ResponseStatus = "yes" | "maybe" | "no" | null;

interface MatrixDate {
  id: string;
  dateTime: Date;
  isBest: boolean;
}

interface MatrixParticipant {
  id: string;
  name: string;
  avatarColor?: string;
  responses: Record<string, ResponseStatus>; // proposedDateId -> status
}

interface AvailabilityMatrixProps {
  dates: MatrixDate[];
  participants: MatrixParticipant[];
}

const statusCell: Record<string, { icon: string; className: string }> = {
  yes: { icon: "✓", className: "bg-green-100 text-green-700" },
  maybe: { icon: "?", className: "bg-amber-100 text-amber-700" },
  no: { icon: "✕", className: "bg-rose-100 text-rose-700" },
  null: { icon: "", className: "bg-muted/50 text-transparent" },
};

export function AvailabilityMatrix({ dates, participants }: AvailabilityMatrixProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 min-w-[420px]">
        <thead>
          <tr>
            <th className="text-left text-sm font-medium text-foreground/50 pb-2 pr-4 min-w-[120px]">
              Participant
            </th>
            {dates.map((d) => (
              <th key={d.id} className="pb-2 min-w-[80px]">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-medium text-foreground/50 uppercase tracking-wider">
                    {formatDayShort(d.dateTime)}
                  </span>
                  <span
                    className={cn(
                      "font-serif text-xl font-bold leading-none",
                      d.isBest ? "text-primary" : "text-foreground"
                    )}
                  >
                    {d.dateTime.getDate()}
                  </span>
                  <span className="text-xs text-foreground/50">
                    {formatMonthShort(d.dateTime)}
                  </span>
                  <span className="text-xs text-foreground/60">{formatTime(d.dateTime)}</span>
                  {d.isBest && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 block" />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.id}>
              <td className="pr-4 py-1">
                <div className="flex items-center gap-2">
                  <UserAvatar name={p.name} avatarColor={p.avatarColor} size="sm" />
                  <span className="text-sm font-medium text-foreground truncate max-w-[80px]">
                    {p.name.split(" ")[0]}
                  </span>
                </div>
              </td>
              {dates.map((d) => {
                const status = p.responses[d.id] ?? null;
                const cell = statusCell[String(status)];
                return (
                  <td key={d.id} className="py-1">
                    <div
                      className={cn(
                        "w-full aspect-square rounded-lg flex items-center justify-center text-sm font-semibold min-w-[36px] h-9",
                        cell.className
                      )}
                      aria-label={status ?? "sans réponse"}
                    >
                      {cell.icon}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
