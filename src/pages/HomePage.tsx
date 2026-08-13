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
    <>
      <section className="hero-media">
        <video
          className="hero-media-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-media-overlay" aria-hidden="true" />
        <div className="container hero-top-badge">
          <p className="badge hero-reveal" style={{ animationDelay: '.1s' }}>계산 엔진 + Mock 해석 기반 MVP</p>
        </div>
        <div className="container hero-media-content">
          <h1 className="hero-headline hero-reveal" style={{ animationDelay: '.28s' }}>
            운명이 당신을<br />이곳으로 이끌었습니다
          </h1>
          <Button className="hero-reveal" style={{ animationDelay: '.5s' }} onClick={() => navigate('/input')}>운명 확인하기</Button>
        </div>
      </section>

      <div className="container">
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
    </>
  );
}
