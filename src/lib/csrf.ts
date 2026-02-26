export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const url = new URL(request.url);
  const expected = url.origin;

  return origin === expected;
}
