import { getCollection, type CollectionEntry } from 'astro:content';

export type PostEntry = CollectionEntry<'posts'>;

export function getPostEntries(): Promise<PostEntry[]> {
  return getCollection('posts');
}
