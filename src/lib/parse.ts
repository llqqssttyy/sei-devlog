type CommentsMode = 'off' | 'giscus' | 'giscus-custom';

const commentsModes = new Set<CommentsMode>(['off', 'giscus', 'giscus-custom']);

export function parseEnabledFlag(value: string | undefined) {
  return value === 'true';
}

export function parseCommentsMode(value: string | undefined, fallback: string) {
  const parsedFallback = commentsModes.has(fallback as CommentsMode)
    ? (fallback as CommentsMode)
    : 'off';
  if (!value) return parsedFallback;
  return commentsModes.has(value as CommentsMode) ? (value as CommentsMode) : parsedFallback;
}

export function isCommentsModeEnabled(mode: CommentsMode) {
  return mode === 'giscus' || mode === 'giscus-custom';
}
