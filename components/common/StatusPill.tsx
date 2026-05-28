import { cn } from "@/lib/utils";

type StatusVariant = "yes" | "maybe" | "no" | "pending" | "confirmed" | "neutral";

interface StatusPillProps {
  children: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  yes: "bg-green-100 text-green-800",
  maybe: "bg-amber-100 text-amber-800",
  no: "bg-rose-100 text-rose-800",
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-green-100 text-green-800",
  neutral: "bg-secondary text-secondary-foreground",
};

export function StatusPill({ children, variant = "neutral", className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
