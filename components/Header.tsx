import Link from 'next/link';

const navigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Insights' }
];

export default function Header() {
  return (
    <header>
      <nav aria-label="Main Navigation">
        <Link href="/" aria-label="Back to homepage">
          <strong>signQA</strong>
        </Link>
        <ul>
          {navigation.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
