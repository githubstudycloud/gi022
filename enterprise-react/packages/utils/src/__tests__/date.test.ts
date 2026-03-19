import { describe, expect, it } from 'vitest';

import { formatDate, getDaysInMonth, isSameDay, relativeTime } from '../date';

describe('formatDate', () => {
  it('formats with default pattern', () => {
    const d = new Date('2024-03-15T10:30:00');
    expect(formatDate(d)).toBe('2024-03-15');
  });

  it('formats with custom pattern', () => {
    const d = new Date('2024-03-15T10:30:45');
    expect(formatDate(d, 'YYYY-MM-DD HH:mm:ss')).toBe('2024-03-15 10:30:45');
  });

  it('returns empty string for invalid date', () => {
    expect(formatDate('invalid')).toBe('');
  });

  it('accepts timestamp', () => {
    const ts = new Date('2024-01-01').getTime();
    expect(formatDate(ts)).toBe('2024-01-01');
  });
});

describe('relativeTime', () => {
  it('returns 刚刚 for less than 1 minute', () => {
    expect(relativeTime(Date.now() - 30_000)).toBe('刚刚');
  });

  it('returns minutes for less than 1 hour', () => {
    expect(relativeTime(Date.now() - 3_600_000 / 2)).toMatch(/\d+分钟前/);
  });
});

describe('isSameDay', () => {
  it('returns true for same day', () => {
    const a = new Date('2024-03-15T09:00:00');
    const b = new Date('2024-03-15T23:59:59');
    expect(isSameDay(a, b)).toBe(true);
  });

  it('returns false for different days', () => {
    expect(isSameDay('2024-03-15', '2024-03-16')).toBe(false);
  });
});

describe('getDaysInMonth', () => {
  it('returns 28 for February in non-leap year', () => {
    expect(getDaysInMonth(2023, 2)).toBe(28);
  });

  it('returns 29 for February in leap year', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('returns 31 for January', () => {
    expect(getDaysInMonth(2024, 1)).toBe(31);
  });
});
