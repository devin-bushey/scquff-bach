// Every image in src/assets/photos is available as a team picture.
// Drop in a jpg/png/webp (browsers can't render HEIC) — no code changes needed.
// The UI circle-crops via CSS, so square-ish photos look best.
const modules = import.meta.glob('../assets/photos/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

// key = filename stem ('june-08-177'), value = bundled URL
export const PHOTOS: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [
    path.split('/').pop()!.replace(/\.(jpg|jpeg|png|webp)$/, ''),
    url,
  ]),
)

export const PHOTO_KEYS = Object.keys(PHOTOS).sort()

export function photoUrl(key: string | null | undefined): string | null {
  return key ? (PHOTOS[key] ?? null) : null
}
