// NOTE: share ids are generated with crypto.randomUUID() (see
// functions/src/services/shared-collections-store.ts), so a bare UUID is accepted
// alongside a full "/shared/<id>" URL (web viewer link).
const SHARE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseShareReference(input: string): string | null {
  const trimmed = input.trim();

  const urlMatch = trimmed.match(/\/shared\/([^/?#]+)/);

  if (urlMatch) {
    return urlMatch[1];
  }

  if (SHARE_ID_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return null;
}
