import type { FiveElementCount } from '../../lib/types';
import { ELEMENT_LABEL } from '../../lib/elements';

const COLORS: Record<keyof FiveElementCount, string> = {
  wood: '#7be3a0',
  fire: '#ff8b6b',
  earth: '#ffcf6b',
  metal: '#cfd6ff',
  water: '#7bb8ff',
};

export default function ElementBars({ elements }: { elements: FiveElementCount }) {
  const max = Math.max(...Object.values(elements), 1);
  const keys = Object.keys(elements) as (keyof FiveElementCount)[];

  return (
    <div role="list" aria-label="오행 분포">
      {keys.map((key) => (
        <div key={key} role="listitem" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ width: 48, fontSize: '.82rem', color: 'var(--text-muted)' }}>{ELEMENT_LABEL[key]}</span>
          <div style={{ flex: 1, height: 10, background: 'var(--bg-alt)', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${(elements[key] / max) * 100}%`,
                height: '100%',
                background: COLORS[key],
                borderRadius: 999,
                transition: 'width .4s ease',
              }}
            />
          </div>
          <span style={{ width: 18, fontSize: '.82rem', color: 'var(--text-muted)', textAlign: 'right' }}>{elements[key]}</span>
        </div>
      ))}
    </div>
  );
}
