/**
 * Compare deux versions sémantiques (ex: "1.0.1" vs "1.0.0").
 * Retourne :
 *   1 si vA > vB (vA plus récent)
 *  -1 si vA < vB (vA plus ancien)
 *   0 si vA == vB
 */
export function compareSemver(vA: string, vB: string): number {
  const cleanA = vA.replace(/^v/i, "").trim();
  const cleanB = vB.replace(/^v/i, "").trim();

  const partsA = cleanA.split(".").map((n) => parseInt(n, 10) || 0);
  const partsB = cleanB.split(".").map((n) => parseInt(n, 10) || 0);

  const maxLen = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < maxLen; i++) {
    const a = partsA[i] ?? 0;
    const b = partsB[i] ?? 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
}
