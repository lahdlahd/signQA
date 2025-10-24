'use client';

import Image from 'next/image';
import Link from 'next/link';

type HeroProps = {
  title: string;
  description: string;
  imageUrl: string;
};

export default function Hero({ title, description, imageUrl }: HeroProps) {
  return (
    <section className="hero">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="button" href="/blog">
          Explore latest insights
        </Link>
      </div>
      <div>
        <Image
          src={imageUrl}
          alt="Inclusive team collaborating in sign language"
          width={640}
          height={480}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          style={{ borderRadius: '1.5rem', width: '100%', height: 'auto' }}
        />
      </div>
    </section>
  );
}
