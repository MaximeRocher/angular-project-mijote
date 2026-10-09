import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  const pipe = new TruncatePipe();

  it('keeps short values untouched', () => {
    expect(pipe.transform('court')).toBe('court');
    expect(pipe.transform('x'.repeat(15))).toBe('x'.repeat(15));
  });

  it('truncates long values with an ellipsis', () => {
    expect(pipe.transform('x'.repeat(16))).toBe(`${'x'.repeat(15)}…`);
  });

  it('supports a custom length', () => {
    expect(pipe.transform('abcdef', 3)).toBe('abc…');
  });

  it('returns an empty string for empty values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });
});
