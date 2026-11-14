/**
 * Loại bỏ các ký hiệu định dạng Markdown inline (`code`, **bold**, *italic*, link)
 * để thu được chuỗi văn bản thuần đồng nhất giữa Markdown thô và React children.
 */
export function cleanMarkdownHeadingText(text) {
  return String(text || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Chuẩn hóa chuỗi tiêu đề tiếng Việt sang id neo (anchor slug) an toàn cho URL/DOM.
 */
export function slugifyHeading(text) {
  return cleanMarkdownHeadingText(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Bộ tạo id duy nhất cho các tiêu đề tuần tự (nếu trùng tiêu đề sẽ thêm hậu tố -1, -2...).
 */
export function createHeadingIdGenerator() {
  const seenCounts = new Map();
  return (rawTitle) => {
    const baseId = slugifyHeading(rawTitle) || 'muc-luc';
    const count = seenCounts.get(baseId) || 0;
    seenCounts.set(baseId, count + 1);
    return count === 0 ? baseId : `${baseId}-${count}`;
  };
}

/**
 * Trích xuất tự động Mục lục (Table of Contents) từ các thẻ tiêu đề ## (h2) và ### (h3)
 * trong nội dung Markdown, bỏ qua các dòng bên trong khối code ```.
 */
export function extractTocFromMarkdown(markdownContent) {
  if (!markdownContent) return [];
  const lines = String(markdownContent).split('\n');
  const headings = [];
  const nextId = createHeadingIdGenerator();
  let insideFence = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith('```')) {
      insideFence = !insideFence;
      continue;
    }
    if (insideFence) continue;

    const match = /^(#{2,3})\s+(.+)$/.exec(trimmed);
    if (!match) continue;

    const level = match[1].length; // 2 cho h2, 3 cho h3
    const cleanTitle = cleanMarkdownHeadingText(match[2]);
    if (!cleanTitle) continue;

    headings.push({
      id: nextId(cleanTitle),
      title: cleanTitle,
      level,
    });
  }

  return headings;
}
