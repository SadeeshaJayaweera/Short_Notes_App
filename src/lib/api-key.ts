import crypto from 'crypto';

export interface GeneratedApiKey {
  rawKey: string;
  keyHash: string;
  prefix: string;
}

/**
 * Generates a secure random API key with a prefix.
 * e.g. "sn_live_3f9a7c..."
 */
export function generateApiKey(prefix = 'sn_live'): GeneratedApiKey {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const rawKey = `${prefix}_${randomBytes}`;
  const keyHash = hashApiKey(rawKey);
  const keyPrefix = rawKey.slice(0, 15); // e.g., "sn_live_3f9a7c"

  return {
    rawKey,
    keyHash,
    prefix: keyPrefix,
  };
}

/**
 * Computes a deterministic SHA-256 hash of a raw API key for secure database storage.
 */
export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey.trim()).digest('hex');
}

/**
 * Validates whether a raw key matches a stored SHA-256 hash using constant-time comparison.
 */
export function verifyApiKey(rawKey: string, storedHash: string): boolean {
  try {
    const computedHash = hashApiKey(rawKey);
    const bufA = Buffer.from(computedHash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
