import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing';

/**
 * Generate a position between two existing positions
 * @param prev - Position before the new item (null for beginning)
 * @param next - Position after the new item (null for end)
 * @returns New position string
 */
export function getPositionBetween(prev: string | null, next: string | null): string {
  return generateKeyBetween(prev, next);
}

/**
 * Generate initial positions for a list of items
 * @param count - Number of positions to generate
 * @returns Array of position strings
 */
export function getInitialPositions(count: number): string[] {
  return generateNKeysBetween(null, null, count);
}
