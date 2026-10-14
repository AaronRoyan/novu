import type { Block } from '@/lib/journal';

import { PhotoBand } from '../PhotoBand';
import { ScrollWords } from '../ScrollWords';
import { SplitText } from '../SplitText';
import styles from './ArticleBody.module.css';
import { Inline } from './Inline';

function Lines({ lines }: { lines: string[] }) {
  return lines.map((line, index) => (
    <span key={index} className={styles.line}>
      <Inline text={line} />
    </span>
  ));
}

type ColumnBlock = Exclude<Block, { type: 'image' | 'scroll' }>;
type Segment = { kind: 'column'; blocks: ColumnBlock[] } | { kind: 'wide'; block: Block };

function ColumnItem({ block }: { block: ColumnBlock }) {
  switch (block.type) {
    case 'p':
      return (
        <p className={block.lead ? styles.lead : styles.p} data-reveal>
          <Lines lines={block.lines} />
        </p>
      );
    case 'quote':
      return (
        <blockquote className={styles.quote} data-reveal>
          <Lines lines={block.lines} />
        </blockquote>
      );
    case 'statement':
      return (
        <p className={styles.statement} data-accent={block.accent || undefined}>
          <SplitText>
            {block.lines.map((line, index) => (
              <span key={index} className={styles.line}>
                {line}
              </span>
            ))}
          </SplitText>
        </p>
      );
    case 'closing':
      return (
        <p className={styles.closing}>
          <SplitText>{block.text}</SplitText>
        </p>
      );
  }
}

/**
 * Lays a story out top to bottom. Text blocks sit in a narrow reading column;
 * photos and scroll-lit passages break out to the full width.
 */
export function ArticleBody({ blocks }: { blocks: Block[] }) {
  // Consecutive text blocks share one column; wide blocks stand alone.
  const segments = blocks.reduce<Segment[]>((acc, block) => {
    const last = acc[acc.length - 1];
    if (block.type === 'image' || block.type === 'scroll') acc.push({ kind: 'wide', block });
    else if (last?.kind === 'column') last.blocks.push(block);
    else acc.push({ kind: 'column', blocks: [block] });
    return acc;
  }, []);

  return (
    <div className={styles.body}>
      {segments.map((segment, index) => {
        if (segment.kind === 'column') {
          return (
            <div key={index} className={styles.column}>
              {segment.blocks.map((block, blockIndex) => (
                <ColumnItem key={blockIndex} block={block} />
              ))}
            </div>
          );
        }
        const { block } = segment;
        if (block.type === 'image') return <PhotoBand key={index} src={block.src} alt={block.alt} />;
        if (block.type === 'scroll') {
          return <ScrollWords key={index} lines={block.lines} accentLine={block.lines.length - 1} />;
        }
        return null;
      })}
    </div>
  );
}
