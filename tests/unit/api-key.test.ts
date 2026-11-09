import { describe, it, expect } from 'vitest';
import { generateApiKey, hashApiKey, verifyApiKey } from '@/lib/api-key';

describe('Developer API Key Service', () => {
  it('generates a valid API key with standard prefix', () => {
    const keyData = generateApiKey('sn_live');

    expect(keyData.rawKey).toMatch(/^sn_live_[a-f0-9]{48}$/);
    expect(keyData.prefix).toMatch(/^sn_live_[a-f0-9]+/);
    expect(keyData.keyHash).toHaveLength(64); // SHA-256 hex string
  });

  it('produces deterministic SHA-256 hash for identical keys', () => {
    const key = 'sn_live_1234567890abcdef1234567890abcdef';
    const hash1 = hashApiKey(key);
    const hash2 = hashApiKey(key);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('successfully verifies a matching raw key against its stored hash', () => {
    const { rawKey, keyHash } = generateApiKey();

    const isValid = verifyApiKey(rawKey, keyHash);
    expect(isValid).toBe(true);
  });

  it('rejects an incorrect or tampered key', () => {
    const { rawKey, keyHash } = generateApiKey();
    const tamperedKey = rawKey.slice(0, -1) + 'x';

    const isValid = verifyApiKey(tamperedKey, keyHash);
    expect(isValid).toBe(false);
  });
});
