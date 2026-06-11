import { supabase } from './supabase'

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
  if (!key) return null
  // uploaded photos are stored as full public URLs; bundled ones as keys
  if (key.startsWith('http')) return key
  return PHOTOS[key] ?? null
}

// Match the bundled photos' spec (square 640px JPEG) so avatars look consistent
// and uploads stay ~100KB. createImageBitmap respects EXIF rotation.
async function resizeToSquareJpeg(file: File, size = 640): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  canvas
    .getContext('2d')!
    .drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size,
    )
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process image'))),
      'image/jpeg',
      0.8,
    )
  })
}

export async function uploadTeamPhoto(teamId: number, file: File): Promise<string> {
  const blob = await resizeToSquareJpeg(file)
  const path = `team-${teamId}-${Date.now()}.jpg`
  const { error } = await supabase.storage
    .from('team-photos')
    .upload(path, blob, { contentType: 'image/jpeg' })
  if (error) throw error
  return supabase.storage.from('team-photos').getPublicUrl(path).data.publicUrl
}
