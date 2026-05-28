export type ResponseStatus = "yes" | "maybe" | "no";

export interface DateScore {
  proposedDateId: string;
  yes: number;
  maybe: number;
  no: number;
  pending: number;
  total: number;
  score: number; // 0-100
}

export function computeScore(yes: number, maybe: number, total: number): number {
  if (total === 0) return 0;
  return Math.round(((yes * 1 + maybe * 0.5) / total) * 100);
}

export function getBestDate(scores: DateScore[]): DateScore | null {
  if (scores.length === 0) return null;
  return scores.reduce((best, curr) =>
    curr.score > best.score ? curr : best
  );
}
