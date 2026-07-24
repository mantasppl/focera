export const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
export const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const NUMBERS = "0123456789";
export const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~";

export const MIN_LENGTH = 4;
export const MAX_LENGTH = 128;
export const DEFAULT_LENGTH = 16;

export type PasswordOptions = {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

export type StrengthLevel =
  | "very-weak"
  | "weak"
  | "fair"
  | "strong"
  | "very-strong";

export type StrengthResult = {
  level: StrengthLevel;
  label: string;
  score: number;
  entropy: number;
  poolSize: number;
};

export function buildCharset(options: PasswordOptions): string {
  let charset = "";
  if (options.lowercase) charset += LOWERCASE;
  if (options.uppercase) charset += UPPERCASE;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;
  return charset;
}

export function hasAnyCharset(options: PasswordOptions): boolean {
  return (
    options.lowercase ||
    options.uppercase ||
    options.numbers ||
    options.symbols
  );
}

function secureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  let value = 0;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0]!;
  } while (value >= limit);
  return value % max;
}

function pickChar(charset: string): string {
  return charset[secureRandomInt(charset.length)]!;
}

function shuffle(chars: string[]): string[] {
  const result = [...chars];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1);
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return result;
}

export function generatePassword(options: PasswordOptions): string {
  const length = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, options.length));
  const charset = buildCharset(options);

  if (!charset) {
    throw new Error("Select at least one character set.");
  }

  const required: string[] = [];
  if (options.lowercase) required.push(pickChar(LOWERCASE));
  if (options.uppercase) required.push(pickChar(UPPERCASE));
  if (options.numbers) required.push(pickChar(NUMBERS));
  if (options.symbols) required.push(pickChar(SYMBOLS));

  const chars: string[] = [];
  for (let i = 0; i < length; i += 1) {
    chars.push(pickChar(charset));
  }

  for (let i = 0; i < required.length && i < length; i += 1) {
    chars[i] = required[i]!;
  }

  return shuffle(chars).join("");
}

export function calculateEntropy(length: number, poolSize: number): number {
  if (length <= 0 || poolSize <= 1) return 0;
  return length * Math.log2(poolSize);
}

export function assessStrength(
  length: number,
  options: PasswordOptions,
): StrengthResult {
  const poolSize = buildCharset(options).length;
  const entropy = calculateEntropy(length, poolSize);

  let level: StrengthLevel;
  let label: string;
  let score: number;

  if (entropy < 28) {
    level = "very-weak";
    label = "Very weak";
    score = 1;
  } else if (entropy < 36) {
    level = "weak";
    label = "Weak";
    score = 2;
  } else if (entropy < 60) {
    level = "fair";
    label = "Fair";
    score = 3;
  } else if (entropy < 128) {
    level = "strong";
    label = "Strong";
    score = 4;
  } else {
    level = "very-strong";
    label = "Very strong";
    score = 5;
  }

  return { level, label, score, entropy, poolSize };
}

export function formatEntropy(bits: number): string {
  if (!Number.isFinite(bits) || bits <= 0) return "0 bits";
  return `${bits.toFixed(1)} bits`;
}
