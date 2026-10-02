import { credentialError } from './credential.validator';

describe('credentialError', () => {
  it('accepts a valid value', () => {
    expect(credentialError('ab1.c')).toBeNull();
    for (const c of ['.', '/', '*', '-', '+']) {
      expect(credentialError(`abc1${c}`)).toBeNull();
    }
  });

  it('rejects too short values', () => {
    expect(credentialError('a1.')).not.toBeNull();
  });

  it('rejects values without digit', () => {
    expect(credentialError('abcd.')).not.toBeNull();
  });

  it('rejects values without allowed special character', () => {
    expect(credentialError('abcd1')).not.toBeNull();
    expect(credentialError('abc1!')).not.toBeNull();
  });
});
