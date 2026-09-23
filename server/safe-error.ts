// Log only known diagnostic codes, never driver messages, SQL, URLs or parameters.
const codes = new Set([
  'DATABASE_URL_MISSING', 'DATABASE_TLS_REQUIRED', 'DATABASE_TLS_MODE_UNSAFE', 'DATABASE_CA_MISSING', 'DATABASE_CA_INVALID', 'DATABASE_SCHEMA_MISSING',
  'ERR_INVALID_URL', 'ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENETUNREACH',
  'SELF_SIGNED_CERT_IN_CHAIN', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'ERR_TLS_CERT_ALTNAME_INVALID', 'CERT_HAS_EXPIRED',
  '28P01', '28000', '3D000', '42P01', '42703', '42501', '53300', '57P01', '08006',
]);
export function safeErrorCode(error: unknown): string {
  const seen = new Set<object>();
  function find(value: unknown, depth: number): string | undefined {
    if (!value || typeof value !== 'object' || depth > 3 || seen.has(value)) return undefined;
    seen.add(value);
    const candidate = value as { code?: unknown; cause?: unknown; errors?: unknown };
    if (typeof candidate.code === 'string' && codes.has(candidate.code)) return candidate.code;
    const causeCode = find(candidate.cause, depth + 1);
    if (causeCode) return causeCode;
    if (Array.isArray(candidate.errors)) {
      for (const nested of candidate.errors) {
        const nestedCode = find(nested, depth + 1);
        if (nestedCode) return nestedCode;
      }
    }
    return undefined;
  }
  return find(error, 0) || 'UNCLASSIFIED';
}
