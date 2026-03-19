/**
 * Extracts a human-readable error message from an Axios API error response.
 * Falls back to the provided default message when the response body does not
 * contain a structured error.
 */
export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const response = (err as any)?.response?.data?.error?.message;
    if (typeof response === 'string' && response.length > 0) return response;
  }
  return fallback;
}
