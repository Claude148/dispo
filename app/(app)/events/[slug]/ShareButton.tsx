"use client";

import { toast } from "sonner";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
  url: string;
}

export function ShareButton({ url }: ShareButtonProps) {
  async function handleShare() {
    await navigator.clipboard.writeText(url);
    toast.success("Lien copié ! 🎉");
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
    >
      <Share2 className="size-4" />
      Partager le lien
    </button>
  );
}
