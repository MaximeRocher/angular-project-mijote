import { ratingInfo } from './rating';

describe('ratingInfo', () => {
  it('returns null without rates', () => {
    expect(ratingInfo(undefined)).toBeNull();
    expect(ratingInfo([])).toBeNull();
  });

  it('averages rates to one decimal and ignores NaN', () => {
    const info = ratingInfo([
      { login: 'a', rate: 5 },
      { login: 'b', rate: 4 },
      { login: 'c', rate: 4 },
      { login: 'd', rate: NaN },
    ]);
    expect(info?.average).toBe(3.3);
    expect(info?.count).toBe(4);
  });
});
