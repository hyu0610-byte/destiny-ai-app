import { Navigate, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StepTrack from '../components/ui/StepTrack';
import ElementBars from '../components/ui/ElementBars';
import { useSajuFlow } from '../context/SajuFlowContext';

const MODE_LABEL: Record<string, string> = {
  traditional: '40년 전통 사주',
  daily: '오늘의 운세',
  tarot: 'MZ 타로마스터',
};

export default function ResultPage() {
  const navigate = useNavigate();
  const { reading, setInput, setMode, setReading } = useSajuFlow();

  if (!reading) {
    return <Navigate to="/input" replace />;
  }

  const { pillars } = reading;

  const startOver = () => {
    setInput(null as never);
    setMode(null as never);
    setReading(null);
    navigate('/input');
  };

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <StepTrack current={3} />

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span className="badge">{MODE_LABEL[reading.mode]}</span>
        <h2 style={{ marginTop: 10 }}>{reading.title}</h2>
        <p style={{ color: 'var(--text-muted)' }}>{reading.summary}</p>
      </div>

      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>사주 8글자 (원국)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, textAlign: 'center', marginBottom: 18 }}>
          {(['year', 'month', 'day', 'hour'] as const).map((key) => (
            <div key={key}>
              <p style={{ fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                {key === 'year' ? '연주' : key === 'month' ? '월주' : key === 'day' ? '일주' : '시주'}
              </p>
              <p style={{ fontFamily: "'Noto Serif KR', serif", fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>{pillars[key]}</p>
            </div>
          ))}
        </div>
        <h3 style={{ fontSize: '1rem', marginBottom: 10 }}>오행 분포 · 주도 기운: {reading.dominantElement}</h3>
        <ElementBars elements={reading.elements} />
      </Card>

      {reading.sections.map((section) => (
        <Card key={section.heading} style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem' }}>{section.heading}</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>{section.body}</p>
        </Card>
      ))}

      <Card style={{ marginBottom: 24, borderColor: 'var(--accent)' }}>
        <h3 style={{ fontSize: '1rem' }}>오늘의 조언</h3>
        <p style={{ margin: 0 }}>{reading.advice}</p>
      </Card>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button onClick={() => navigate('/modes')}>다른 모드 보기</Button>
        <Button variant="ghost" onClick={() => navigate('/history')}>히스토리에서 보기</Button>
        <Button variant="ghost" onClick={startOver}>새로 시작하기</Button>
      </div>
    </div>
  );
}
