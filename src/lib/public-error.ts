/**
 * Public UI must never render an exception message directly. Callers provide
 * localized, domain-appropriate copy; the original error remains available to
 * redacted diagnostics outside the rendered tree.
 */
export function publicErrorMessage(_error: unknown, localizedFallback: string) {
  return localizedFallback;
}
