/**
 * Spaced Repetition System (SRS) based on SuperMemo SM-2 algorithm.
 * 
 * Quality Ratings (mapped from 4 user buttons):
 * 1: Again (Complete blackout, requires relearning)
 * 2: Hard (Recalled with significant effort, intervals grow slowly)
 * 3: Good (Recalled with appropriate effort, standard interval growth)
 * 4: Easy (Effortless recall, accelerated interval growth)
 */

export interface SRSState {
  easeFactor: number;
  interval: number; // in days
  repetitions: number;
}

export interface SRSReviewResult extends SRSState {
  dueDate: Date;
  quality: number;
}

export const MIN_EASE_FACTOR = 1.3;
export const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Calculates next review date and updated SM-2 parameters based on recall performance.
 *
 * @param current Current card state (easeFactor, interval, repetitions)
 * @param grade User rating (1 = Again, 2 = Hard, 3 = Good, 4 = Easy)
 * @param baseDate Reference date for scheduling (defaults to now)
 */
export function calculateNextReview(
  current: SRSState,
  grade: number,
  baseDate: Date = new Date()
): SRSReviewResult {
  let { easeFactor = DEFAULT_EASE_FACTOR, interval = 0, repetitions = 0 } = current;

  // Map 4-button grade to SM-2 quality (0 to 5)
  // 1 (Again) -> 1
  // 2 (Hard)  -> 3
  // 3 (Good)  -> 4
  // 4 (Easy)  -> 5
  const qualityMap: Record<number, number> = {
    1: 1,
    2: 3,
    3: 4,
    4: 5,
  };

  const q = qualityMap[grade] ?? 3;

  if (grade === 1) {
    // Reset repetitions on lapse
    repetitions = 0;
    interval = 1;
    // Slight penalty to ease factor on failure
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = grade === 2 ? 1 : grade === 4 ? 3 : 1;
    } else if (repetitions === 1) {
      interval = grade === 2 ? 2 : grade === 4 ? 8 : 6;
    } else {
      if (grade === 2) {
        // Hard: 1.2x previous interval
        interval = Math.max(interval + 1, Math.round(interval * 1.2));
      } else if (grade === 3) {
        // Good: standard SM-2 interval expansion
        interval = Math.max(interval + 1, Math.round(interval * easeFactor));
      } else if (grade === 4) {
        // Easy: accelerated interval expansion
        interval = Math.max(interval + 2, Math.round(interval * easeFactor * 1.3));
      }
    }

    // Standard SM-2 Ease Factor formula:
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + efDelta);
    repetitions += 1;
  }

  // Round ease factor to 2 decimal places for clean storage
  easeFactor = Math.round(easeFactor * 100) / 100;

  const dueDate = new Date(baseDate.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    easeFactor,
    interval,
    repetitions,
    dueDate,
    quality: q,
  };
}
