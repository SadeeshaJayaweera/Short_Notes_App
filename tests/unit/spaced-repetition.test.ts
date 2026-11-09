import { describe, it, expect } from 'vitest';
import {
  calculateNextReview,
  DEFAULT_EASE_FACTOR,
  MIN_EASE_FACTOR,
} from '@/lib/spaced-repetition';

describe('Spaced Repetition (SM-2) Engine', () => {
  const baseDate = new Date('2026-11-10T00:00:00.000Z');

  it('resets repetitions and sets interval to 1 day on Grade 1 (Again)', () => {
    const currentState = {
      easeFactor: 2.5,
      interval: 10,
      repetitions: 4,
    };

    const result = calculateNextReview(currentState, 1, baseDate);

    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBeLessThan(currentState.easeFactor);
    expect(result.dueDate.getTime()).toBe(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000);
  });

  it('sets interval to 1 on initial successful review (Grade 3 - Good)', () => {
    const currentState = {
      easeFactor: DEFAULT_EASE_FACTOR,
      interval: 0,
      repetitions: 0,
    };

    const result = calculateNextReview(currentState, 3, baseDate);

    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBe(DEFAULT_EASE_FACTOR);
    expect(result.dueDate.getTime()).toBe(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000);
  });

  it('sets interval to 6 on second successful review (Grade 3 - Good)', () => {
    const currentState = {
      easeFactor: 2.5,
      interval: 1,
      repetitions: 1,
    };

    const result = calculateNextReview(currentState, 3, baseDate);

    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
    expect(result.dueDate.getTime()).toBe(baseDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  });

  it('multiplies interval by ease factor on third review (Grade 3 - Good)', () => {
    const currentState = {
      easeFactor: 2.5,
      interval: 6,
      repetitions: 2,
    };

    const result = calculateNextReview(currentState, 3, baseDate);

    expect(result.repetitions).toBe(3);
    expect(result.interval).toBe(Math.round(6 * 2.5)); // 15 days
    expect(result.dueDate.getTime()).toBe(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000);
  });

  it('accelerates interval and increases ease factor on Grade 4 (Easy)', () => {
    const currentState = {
      easeFactor: 2.5,
      interval: 6,
      repetitions: 2,
    };

    const result = calculateNextReview(currentState, 4, baseDate);

    expect(result.repetitions).toBe(3);
    expect(result.interval).toBeGreaterThan(Math.round(6 * 2.5));
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });

  it('never decreases ease factor below MIN_EASE_FACTOR (1.3)', () => {
    let state = {
      easeFactor: 1.35,
      interval: 2,
      repetitions: 0,
    };

    // Fail multiple times
    for (let i = 0; i < 5; i++) {
      state = calculateNextReview(state, 1, baseDate);
    }

    expect(state.easeFactor).toBe(MIN_EASE_FACTOR);
  });
});
