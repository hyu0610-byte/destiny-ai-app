import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import StepTrack from '../components/ui/StepTrack';
import { useSajuFlow } from '../context/SajuFlowContext';
import { calculateSajuBase } from '../lib/sajuCalculation';
import { requestAIInterpretation } from '../lib/interpretApi';
import { saveReading } from '../lib/history';
import { getToken } from '../lib/apiClient';
import { ApiRequestError } from '../lib/auth';
import type { SajuMode, SajuReading } from '../lib/types';

const MODES: { id: SajuMode; image: string; name: string; tag: string; desc: string; requiresTime: boolean }[] = [
  { id: 'traditional', image: '/masters/grandma.jpg', name: '40년 전통 사주', tag: '전통 명리학 해석', desc: '깊은 연륜의 정통 사주풀이로 인생 전체 흐름을 짚어드립니다.', requiresTime: true },
  { id: 'daily', image: '/masters/officeguy.jpg', name: '오늘의 운세', tag: '현실 조언형', desc: '오늘 하루의 일·관계·선택에 바로 적용할 수 있는 실전형 조언을 전달합니다.', requiresTime: false },
  { id: 'tarot', image: '/masters/tarot.jpg', name: 'MZ 타로마스터', tag: '감각적인 타로 해석', desc: '트렌디한 톤앤매너로 풀어내는 타로 메시지를 확인해보세요.', requiresTime: false },
];

export default function ModeSelectPage() {
  const navigate = useNavigate();
  const { input, setMode, setReading } = useSajuFlow();
  const [loadingMode, setLoadingMode] = useState<SajuMode | null>(null);
  const [error, setError] = useState('');
  const [retryTarget, setRetryTarget] = useState<SajuMode | null>(null);

  useEffect(() => {
    setError('');
    setRetryTarget(null);
  }, [input]);

  if (!input) {
    return <Navigate to="/input" replace />;
  }

  const runGeneration = async (id: SajuMode) => {
    setError('');
    setRetryTarget(null);
    setLoadingMode(id);

    let base;
    try {
      base = calculateSajuBase(input);
    } catch {
      setError('사주 원국 산출에 실패했어요. 입력한 생년월일시를 다시 확인해 주세요.');
      setLoadingMode(null);
      return;
    }

    let interpretation;
    try {
      interpretation = await requestAIInterpretation(input, id, base);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : 'AI 해석 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.'
      );
      setRetryTarget(id);
      setLoadingMode(null);
      return;
    }

    const reading: SajuReading = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      input,
      mode: id,
      pillars: base.pillars,
      elements: base.elements,
      dominantElement: base.dominantElement,
      ...interpretation,
    };

    setMode(id);
    setReading(reading);

    // 로그인 상태일 때만 서버에 저장을 시도한다. 비로그인 사용자는 결과만 보고
    // 히스토리에는 남기지 않는다 (히스토리 조회 자체가 로그인 필요 기능).
    if (getToken()) {
      try {
        await saveReading(reading);
      } catch {
        // 저장 실패는 결과 확인 자체를 막지 않는다. 히스토리 목록에서 재시도 가능.
      }
    }

    setLoadingMode(null);
    navigate('/result');
  };

  const handleSelect = (id: SajuMode, disabled: boolean) => {
    if (disabled || loadingMode) return;
    void runGeneration(id);
  };

  if (loadingMode) {
    return (
      <div className="container">
        <Spinner label="AI가 사주를 해석하는 중입니다... (최대 몇십 초 소요될 수 있어요)" />
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <StepTrack current={2} />
      <h2 style={{ textAlign: 'center' }}>해석 모드를 선택해 주세요</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 28 }}>
        {input.name}님, 같은 원국을 바탕으로 원하는 분위기의 해석을 골라보세요.
      </p>

      {error && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <p className="error-text" role="alert" style={{ marginBottom: retryTarget ? 8 : 0 }}>{error}</p>
          {retryTarget && (
            <Button size="sm" onClick={() => runGeneration(retryTarget)}>다시 시도</Button>
          )}
        </div>
      )}

      <div className="mode-grid">
        {MODES.map((m) => {
          const disabled = m.requiresTime && input.timeUnknown;
          return (
            <Card
              key={m.id}
              hover={!disabled}
              disabled={disabled}
              onClick={() => handleSelect(m.id, disabled)}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(m.id, disabled); }}
            >
              <img
                src={m.image}
                alt={`${m.name} 캐릭터 이미지`}
                style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: 12 }}
              />
              <span className="badge" style={{ marginBottom: 8 }}>{m.tag}</span>
              <h3 style={{ fontSize: '1.05rem' }}>{m.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '.88rem', margin: 0 }}>{m.desc}</p>
              {disabled && <p className="error-text" style={{ marginTop: 10 }}>출생시간 미입력으로 이용할 수 없어요</p>}
            </Card>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate('/input')}>정보 다시 입력하기</Button>
      </div>
    </div>
  );
}
