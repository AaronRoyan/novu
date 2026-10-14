import Image from 'next/image';

import mark from '@/assets/brand/mark-white.png';

import styles from './Logo.module.css';

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`${styles.logo} ${className ?? ''}`}>
      <Image src={mark} alt="" width={26} height={26} className={styles.mark} />
      <span className={styles.wordmark}>NOVU</span>
    </span>
  );
}
