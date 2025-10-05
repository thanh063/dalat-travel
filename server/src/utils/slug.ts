// slugify tiếng Việt an toàn: bỏ dấu, chỉ [a-z0-9-]
export function toSlug(input: string) {
  const base = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')      // bỏ dấu
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return base || `p-${Date.now()}`;
}
