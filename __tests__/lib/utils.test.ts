import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  calculateNextRunDate,
  getFrequencyLabel,
  getStatusColor,
} from '@/lib/utils';

describe('cn (className utility)', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('merges Tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});

describe('formatCurrency', () => {
  it('formats number as USD currency', () => {
    expect(formatCurrency(100)).toBe('$100.00');
  });

  it('formats string as USD currency', () => {
    expect(formatCurrency('50.5')).toBe('$50.50');
  });

  it('formats with different currency', () => {
    expect(formatCurrency(100, 'EUR')).toBe('€100.00');
  });

  it('handles decimal values', () => {
    expect(formatCurrency(99.99)).toBe('$99.99');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('formatDate', () => {
  it('formats Date object', () => {
    const date = new Date('2024-03-15T12:00:00');
    expect(formatDate(date)).toMatch(/Mar 15, 2024/);
  });

  it('formats date string', () => {
    expect(formatDate('2024-03-15T12:00:00')).toMatch(/Mar 15, 2024/);
  });
});

describe('formatDateTime', () => {
  it('formats Date object with time', () => {
    const date = new Date('2024-03-15T14:30:00');
    const result = formatDateTime(date);
    expect(result).toMatch(/Mar 15, 2024/);
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('formats date string with time', () => {
    const result = formatDateTime('2024-03-15T14:30:00');
    expect(result).toMatch(/Mar 15, 2024/);
  });
});

describe('calculateNextRunDate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-03-15T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns future start date as-is', () => {
    const futureDate = new Date('2024-04-01');
    const result = calculateNextRunDate('weekly', futureDate);
    expect(result.toISOString()).toBe(futureDate.toISOString());
  });

  it('returns same date for one_time frequency', () => {
    const pastDate = new Date('2024-03-01');
    const result = calculateNextRunDate('one_time', pastDate);
    expect(result.toISOString()).toBe(pastDate.toISOString());
  });

  it('calculates next weekly run date', () => {
    const startDate = new Date('2024-03-08');
    const result = calculateNextRunDate('weekly', startDate);
    expect(result > new Date('2024-03-15T12:00:00')).toBe(true);
    expect(result.getDay()).toBe(startDate.getDay());
  });

  it('calculates next bi-weekly run date', () => {
    const startDate = new Date('2024-03-01');
    const result = calculateNextRunDate('bi_weekly', startDate);
    expect(result > new Date('2024-03-15T12:00:00')).toBe(true);
  });

  it('calculates next monthly run date', () => {
    const startDate = new Date('2024-02-15');
    const result = calculateNextRunDate('monthly', startDate);
    expect(result.getMonth()).toBeGreaterThanOrEqual(3); // April or later
  });

  it('calculates custom frequency run date', () => {
    const startDate = new Date('2024-03-10');
    const result = calculateNextRunDate('custom', startDate, 10);
    expect(result > new Date('2024-03-15T12:00:00')).toBe(true);
  });
});

describe('getFrequencyLabel', () => {
  it('returns correct label for one_time', () => {
    expect(getFrequencyLabel('one_time')).toBe('One-time');
  });

  it('returns correct label for weekly', () => {
    expect(getFrequencyLabel('weekly')).toBe('Weekly');
  });

  it('returns correct label for bi_weekly', () => {
    expect(getFrequencyLabel('bi_weekly')).toBe('Bi-weekly');
  });

  it('returns correct label for monthly', () => {
    expect(getFrequencyLabel('monthly')).toBe('Monthly');
  });

  it('returns correct label for custom with days', () => {
    expect(getFrequencyLabel('custom', 5)).toBe('Every 5 days');
  });

  it('returns Custom for custom without days', () => {
    expect(getFrequencyLabel('custom')).toBe('Custom');
  });

  it('returns unknown frequency as-is', () => {
    expect(getFrequencyLabel('unknown')).toBe('unknown');
  });
});

describe('getStatusColor', () => {
  it('returns green for active status', () => {
    expect(getStatusColor('active')).toBe('bg-green-100 text-green-800');
  });

  it('returns green for completed status', () => {
    expect(getStatusColor('completed')).toBe('bg-green-100 text-green-800');
  });

  it('returns green for success status', () => {
    expect(getStatusColor('success')).toBe('bg-green-100 text-green-800');
  });

  it('returns yellow for pending status', () => {
    expect(getStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800');
  });

  it('returns yellow for processing status', () => {
    expect(getStatusColor('processing')).toBe('bg-yellow-100 text-yellow-800');
  });

  it('returns gray for paused status', () => {
    expect(getStatusColor('paused')).toBe('bg-gray-100 text-gray-800');
  });

  it('returns red for failed status', () => {
    expect(getStatusColor('failed')).toBe('bg-red-100 text-red-800');
  });

  it('returns red for cancelled status', () => {
    expect(getStatusColor('cancelled')).toBe('bg-red-100 text-red-800');
  });

  it('returns red for error status', () => {
    expect(getStatusColor('error')).toBe('bg-red-100 text-red-800');
  });

  it('returns gray for unknown status', () => {
    expect(getStatusColor('unknown')).toBe('bg-gray-100 text-gray-800');
  });
});
