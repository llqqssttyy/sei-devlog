import readingTime from 'reading-time';
import type { PostEntry } from './post-queries';

export function isPublishedPost(post: PostEntry) {
  return !post.data.draft;
}

export function sortPostsByNewest(posts: PostEntry[]) {
  return [...posts].sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function selectFeaturedPost(posts: PostEntry[]) {
  return posts.find((post) => post.data.homeFeatured) ?? posts[0];
}

export function selectHomeHeroPosts(posts: PostEntry[], featuredPost: PostEntry | undefined) {
  const heroCandidates = posts.filter((post) => post.id !== featuredPost?.id);
  const pinnedHeroPosts = heroCandidates
    .filter((post) => post.data.homeHeroOrder)
    .sort((a, b) => {
      const orderDelta = (a.data.homeHeroOrder ?? 0) - (b.data.homeHeroOrder ?? 0);
      if (orderDelta !== 0) return orderDelta;
      return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    });
  const fallbackHeroPosts = heroCandidates.filter((post) => !post.data.homeHeroOrder);

  return [...pinnedHeroPosts, ...fallbackHeroPosts].slice(0, 2);
}

export function selectHomeGridPosts(posts: PostEntry[], featuredPost: PostEntry | undefined) {
  const gridCandidates = posts.filter((post) => post.id !== featuredPost?.id);
  const pinnedGridPosts = gridCandidates
    .filter((post) => post.data.homeOrder)
    .sort((a, b) => {
      const orderDelta = (a.data.homeOrder ?? 0) - (b.data.homeOrder ?? 0);
      if (orderDelta !== 0) return orderDelta;
      return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    });
  const fallbackGridPosts = gridCandidates.filter((post) => !post.data.homeOrder);

  return [...pinnedGridPosts, ...fallbackGridPosts].slice(0, 3);
}

export function selectRelatedPosts(posts: PostEntry[], currentPost: PostEntry) {
  return posts
    .filter((post) => post.id !== currentPost.id)
    .sort((a, b) => {
      const sameCategoryA =
        a.data.category && a.data.category === currentPost.data.category ? 1 : 0;
      const sameCategoryB =
        b.data.category && b.data.category === currentPost.data.category ? 1 : 0;
      if (sameCategoryA !== sameCategoryB) return sameCategoryB - sameCategoryA;
      return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    })
    .slice(0, 3);
}

export function getReadingTimeMinutes(body: string | undefined) {
  return Math.max(1, Math.round(readingTime(body ?? '').minutes));
}
