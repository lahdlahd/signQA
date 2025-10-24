import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <p>We could not locate the page you were looking for. Try exploring our latest insights instead.</p>
      <Link className="button" href="/blog">
        Visit the blog
      </Link>
    </>
  );
}
