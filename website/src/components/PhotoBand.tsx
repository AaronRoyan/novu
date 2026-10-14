import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';

import styles from './PhotoBand.module.css';

type Props = {
  src: StaticImageData;
  alt: string;
  children?: ReactNode;
};

/**
 * Full-bleed photo that opens from an inset card to the full width as it
 * scrolls in, with the image drifting slower than the page (ScrollFx `--p`).
 */
export function PhotoBand({ src, alt, children }: Props) {
  return (
    <figure className={styles.band} data-scroll>
      <div className={styles.media}>
        <Image src={src} alt={alt} fill placeholder="blur" sizes="100vw" className={styles.image} />
      </div>
      {children ? <figcaption className={`container ${styles.caption}`}>{children}</figcaption> : null}
    </figure>
  );
}
