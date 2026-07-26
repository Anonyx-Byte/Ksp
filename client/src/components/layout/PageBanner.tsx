'use client';

import styles from './PageBanner.module.css';

interface PageBannerProps {
  title: string;
  titleAccent: string;
  subtitle: string;
  imageSrc: string;
}

export default function PageBanner({ title, titleAccent, subtitle, imageSrc }: PageBannerProps) {
  return (
    <header className={styles.banner}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt=""
        className={styles.bgImage}
        aria-hidden="true"
      />
      <div className={styles.content}>
        <h2 className={styles.title}>
          <span className={styles.accent}>{titleAccent}</span> {title}
        </h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </header>
  );
}
