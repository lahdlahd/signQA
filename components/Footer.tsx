import Link from 'next/link';
import { siteConfig } from '@/lib/siteConfig';

export default function Footer() {
  return (
    <footer>
      <p>
        © {new Date().getFullYear()} {siteConfig.name}. Built for accessible conversations in every language.
      </p>
      <p>
        <Link href="/sitemap.xml">Sitemap</Link> · <Link href="/privacy">Privacy</Link>
      </p>
    </footer>
  );
}
