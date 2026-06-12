import type { PostEntry } from './post-queries';

type FormatPostLlmsOptions = {
  canonicalUrl: string;
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatPostLlms(post: PostEntry, { canonicalUrl }: FormatPostLlmsOptions) {
  const metadata = [
    `Title: ${post.data.title}`,
    `Description: ${post.data.description}`,
    `Published: ${formatDate(post.data.pubDate)}`,
    post.data.updatedDate ? `Updated: ${formatDate(post.data.updatedDate)}` : undefined,
    post.data.category ? `Category: ${post.data.category}` : undefined,
    `Canonical URL: ${canonicalUrl}`,
  ].filter(Boolean);

  return [
    `# ${post.data.title}`,
    '',
    ...metadata,
    '',
    '## Content',
    '',
    post.body?.trim() ?? '',
    '',
  ].join('\n');
}
