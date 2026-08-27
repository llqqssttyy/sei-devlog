import type { APIContext, GetStaticPaths } from 'astro';
import { getPostEntries, type PostEntry } from '../../../content/post-queries';
import {
  isPublishedPost,
  sortPostsByNewest,
} from '../../../content/post-helpers';
import { formatPostLlms } from '../../../content/post-llms';
import { withBase } from '../../../utils/paths';

export const getStaticPaths = (async () => {
  const posts = sortPostsByNewest((await getPostEntries()).filter(isPublishedPost));

  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}) satisfies GetStaticPaths;

type Props = {
  post: PostEntry;
};

export function GET({ props, site }: APIContext<Props>) {
  const { post } = props;
  const canonicalUrl = new URL(withBase(`/posts/${post.id}/`), site).toString();

  return new Response(formatPostLlms(post, { canonicalUrl }), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
