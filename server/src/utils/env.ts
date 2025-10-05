export function env(key: string, fallback?: string) {
  const v = process.env[key]
  if (v === undefined || v === null || v === '') {
    if (fallback !== undefined) return fallback
    throw new Error(`Missing env ${key}`)
  }
  return v
}
