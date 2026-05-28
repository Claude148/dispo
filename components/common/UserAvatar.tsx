import { getAvatarColor } from "@/lib/avatar-colors";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatarColor?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-11 text-base",
};

export function UserAvatar({ name, avatarColor = "0", size = "md", className }: UserAvatarProps) {
  const color = getAvatarColor(avatarColor);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold shrink-0",
        sizes[size],
        className
      )}
      style={{ backgroundColor: color.bg, color: color.text }}
      aria-label={name}
    >
      {initials}
    </span>
  );
}
