/** User-facing message of an error thrown by the HTTP interceptor (always an Error). */
export const errorMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;
