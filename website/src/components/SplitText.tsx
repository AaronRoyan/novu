import { Children, cloneElement, isValidElement, type CSSProperties, type ReactNode } from 'react';

type Counter = { index: number };

function splitWords(node: ReactNode, counter: Counter): ReactNode {
  if (typeof node === 'string') {
    return node.split(/(\s+)/).map((part) => {
      if (!part || /^\s+$/.test(part)) return part;
      const index = counter.index++;
      return (
        <span key={index} className="sw">
          <span style={{ '--i': index } as CSSProperties}>{part}</span>
        </span>
      );
    });
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return cloneElement(node, undefined, splitWords(node.props.children, counter));
  }
  return node;
}

type Props = {
  children: ReactNode;
  delay?: number;
  /** Animate on page load with CSS alone; use for headings on the first screen. */
  immediate?: boolean;
};

/**
 * Splits its text into words that rise out of a mask, one after another, when
 * the heading scrolls into view (or straight away with `immediate`). Nested
 * elements (e.g. an accent span) keep their wrapper and have their own words
 * split too.
 */
export function SplitText({ children, delay = 0, immediate }: Props) {
  const counter: Counter = { index: 0 };
  const trigger = immediate ? { 'data-split': 'now' } : { 'data-reveal': 'split' };
  return (
    <span {...trigger} style={{ '--d': delay } as CSSProperties}>
      {Children.map(children, (child) => splitWords(child, counter))}
    </span>
  );
}
