import { Fragment, type ReactNode } from 'react';

import styles from './ArticleBody.module.css';

/** Renders `**bold**` and `_quiet_` marks inside a line of story text. */
export function Inline({ text }: { text: string }): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|_[^_]+_)/).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return (
        <span key={index} className={styles.quiet}>
          {part.slice(1, -1)}
        </span>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}
