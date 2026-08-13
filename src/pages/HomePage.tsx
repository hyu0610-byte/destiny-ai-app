import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const MODE_PREVIEW = [
  { image: '/masters/grandma.jpg', name: '40년 전통 사주', desc: '정통 명리학 해석으로 인생 전체 흐름을 짚어드립니다.' },
  { image: '/masters/officeguy.jpg', name: '오늘의 운세', desc: '오늘 하루 실전형 조언을 간결하게 전달합니다.' },
  { image: '/masters/tarot.jpg', name: 'MZ 타로마스터', desc: '감각적인 타로 메시지를 트렌디하게 해석합니다.' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <section style={{ textAlign: 'center', padding: '48px 0 32px' }}>
        <p className="badge" style={{ marginBottom: 14 }}>계산 엔진 + Mock 해석 기반 MVP</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
          같은 생년월일,<br />
          <span style={{ background: 'var(--accent-grad)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
            정확하게 계산된 내 사주 8글자
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto 28px' }}>
          표준만세력 기반 계산 엔진이 사주 8글자를 먼저 산출하고, 원하는 해석 모드를 골라 결과를 확인해보세요.
          입력한 정보와 결과는 이 브라우저에 안전하게 저장됩니다.
        </p>
        <Button onClick={() => navigate('/input')}>지금 내 사주 확인하기</Button>
      </section>

      <section style={{ padding: '24px 0 56px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.3rem', marginBottom: 24 }}>3가지 해석 모드 중 선택</h2>
        <div className="mode-grid">
          {MODE_PREVIEW.map((m) => (
            <Card key={m.name}>
              <img
                src={m.image}
                alt={`${m.name} 캐릭터 이미지`}
                style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}
              />
              <h3 style={{ fontSize: '1.05rem' }}>{m.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '.9rem', margin: 0 }}>{m.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
