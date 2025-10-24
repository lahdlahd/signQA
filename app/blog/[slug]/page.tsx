import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { getAllPosts, getPostBySlug } from '@/content/posts';
import { buildMetadata } from '@/lib/metadata';
import { articleJsonLd } from '@/lib/structuredData';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return buildMetadata({ title: 'Post not found', path: `/blog/${params.slug}` });
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.heroImage,
    type: 'article',
    publishedTime: post.publishedAt,
    updatedTime: post.updatedAt
  });
}

export const revalidate = 3600;

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const article = post;

  return (
    <article>
      <JsonLd data={articleJsonLd(article)} />
      <header>
        <h1>{article.title}</h1>
        <p>
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          {article.updatedAt ? ` · Updated ${new Date(article.updatedAt).toLocaleDateString()}` : null}
          {' · '}
          {article.readingTime}
        </p>
        <p>By {article.author}</p>
        <Image
          src={article.heroImage}
          alt={article.title}
          width={960}
          height={540}
          sizes="(max-width: 768px) 100vw, 960px"
          priority={false}
          style={{ borderRadius: '1.5rem', width: '100%', height: 'auto', marginTop: '2rem' }}
        />
      </header>
      <section style={{ marginTop: '2.5rem' }} dangerouslySetInnerHTML={{ __html: article.content }} />
      <footer style={{ marginTop: '2rem' }}>
        <strong>Tags:</strong> {article.tags.join(', ')}
      </footer>
    </article>
  );
}
