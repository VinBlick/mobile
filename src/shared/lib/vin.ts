/** VIN helpers (ISO 3779): 17 chars, no I/O/Q */
export const VIN_LENGTH = 17;

export const normalizeVin = (value: string) => value.toUpperCase().replace(/[\s\-_.:]/g, "");

export type VinProblem = "empty" | "forbidden" | "chars" | "length";

export const validateVin = (value: string): VinProblem | null => {
  const vin = normalizeVin(value);
  if (!vin) return "empty";
  if (/[IOQ]/.test(vin)) return "forbidden";
  if (!/^[A-Z0-9]+$/.test(vin)) return "chars";
  if (vin.length !== VIN_LENGTH) return "length";
  return null;
};

const VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5,
  P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

/**
 * North-American check digit (position 9). European VINs often don't use it,
 * so this is only a hint, never a blocker.
 */
export const hasValidCheckDigit = (vin: string) => {
  if (vin.length !== VIN_LENGTH) return false;
  let sum = 0;
  for (let i = 0; i < VIN_LENGTH; i++) {
    const c = vin[i];
    const v = /\d/.test(c) ? Number(c) : VALUES[c];
    if (v === undefined) return false;
    sum += v * WEIGHTS[i];
  }
  const check = sum % 11 === 10 ? "X" : String(sum % 11);
  return vin[8] === check;
};

/**
 * Extracts a VIN from scanned barcode data. Code 39 labels in door frames
 * often carry an "I" import prefix or trailing characters.
 */
export const vinFromBarcode = (raw: string): string | null => {
  const data = normalizeVin(raw);
  // labels like "VIN:…/2020" — look for a 17 character run in the raw text first
  const runs = raw.toUpperCase().match(/(?<![A-Z0-9])[A-HJ-NPR-Z0-9]{17}(?![A-Z0-9])/g) ?? [];
  const candidates = [data, data.replace(/^I/, ""), ...runs, ...(data.match(/[A-HJ-NPR-Z0-9]{17}/g) ?? [])];
  for (const c of candidates) if (c.length === VIN_LENGTH && !validateVin(c)) return c;
  return null;
};
