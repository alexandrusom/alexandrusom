/** Prefix a /public path with the base path (needed while the site lives at github.io/alexandrusom). */
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
