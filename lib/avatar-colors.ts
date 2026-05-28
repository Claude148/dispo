export const AVATAR_COLORS = [
  { bg: "#E85D3B", text: "#FFFFFF" }, // corail
  { bg: "#6FBF7E", text: "#FFFFFF" }, // vert sauge
  { bg: "#4A90D9", text: "#FFFFFF" }, // bleu
  { bg: "#9B59B6", text: "#FFFFFF" }, // violet
  { bg: "#E8B547", text: "#FFFFFF" }, // doré
  { bg: "#D96A7F", text: "#FFFFFF" }, // rose
  { bg: "#2ECC9A", text: "#FFFFFF" }, // turquoise
  { bg: "#7A6F66", text: "#FFFFFF" }, // brun-gris
] as const;

export function getAvatarColor(idOrIndex: string | number) {
  if (typeof idOrIndex === "number") {
    return AVATAR_COLORS[idOrIndex % AVATAR_COLORS.length];
  }
  // Déterministe : somme des char codes mod longueur palette
  const sum = idOrIndex.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function getAvatarColorIndex(id: string): string {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return String(sum % AVATAR_COLORS.length);
}
