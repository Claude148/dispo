import { UserAvatar } from "./UserAvatar";
import { cn } from "@/lib/utils";

interface Person {
  id: string;
  name: string;
  avatarColor?: string;
}

interface AvatarStackProps {
  people: Person[];
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function AvatarStack({ people, max = 4, size = "sm", className }: AvatarStackProps) {
  const visible = people.slice(0, max);
  const rest = people.length - max;

  return (
    <div className={cn("flex items-center", className)}>
      {visible.map((person, i) => (
        <UserAvatar
          key={person.id}
          name={person.name}
          avatarColor={person.avatarColor}
          size={size}
          className={cn("ring-2 ring-background", i > 0 && "-ml-2")}
        />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full ring-2 ring-background -ml-2 text-xs font-medium",
            "bg-muted text-muted-foreground",
            size === "sm" ? "size-7" : "size-9"
          )}
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
