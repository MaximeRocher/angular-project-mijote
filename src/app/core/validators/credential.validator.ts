export const CREDENTIAL_MIN_LENGTH = 5;
export const CREDENTIAL_SPECIAL_CHARS = './*-+';

const DIGIT = /\d/;
const SPECIAL = /[./*\-+]/;

/** Returns an error message, or null when the value meets the credential rules. */
export function credentialError(value: string): string | null {
  if (value.length < CREDENTIAL_MIN_LENGTH) {
    return `${CREDENTIAL_MIN_LENGTH} caractères minimum`;
  }
  if (!DIGIT.test(value)) {
    return 'Au moins un chiffre requis';
  }
  if (!SPECIAL.test(value)) {
    return `Au moins un caractère spécial parmi ${CREDENTIAL_SPECIAL_CHARS} requis`;
  }
  return null;
}
