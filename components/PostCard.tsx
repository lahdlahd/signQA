import Link from 'next/link';
import type { Post } from '@/content/posts';

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="card" itemScope itemType="https://schema.org/BlogPosting">
      <header>
        <h3 itemProp="headline">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <p>
          <time dateTime={post.publishedAt} itemProp="datePublished">
            {new Date(post.publishedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </time>
          {' · '}
          {post.readingTime}
        </p>
      </header>
      <p itemProp="description">{post.excerpt}</p>
      <p>
        <strong>Tags:</strong> {post.tags.join(', ')}
      </p>
    </article>
  );
}
