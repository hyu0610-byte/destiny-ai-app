import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import LoginModal from '../components/layout/LoginModal';
import { useAuth } from '../context/AuthContext';
import { useSajuFlow } from '../context/SajuFlowContext';
import { getHistory, clearHistory } from '../lib/history';
import { ApiRequestError } from '../lib/auth';
import type { SajuReading } from '../lib/types';

const MODE_LABEL: Record<string, string> = {
  traditional: '40년 전통 사주',
  daily: '오늘의 운세',
  tarot: 'MZ 타로마스터',
};

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { setReading } = useSajuFlow();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [items, setItems] = useState<SajuReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    getHistory()
      .then((data) => { if (active) setItems(data); })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof ApiRequestError ? err.message : '히스토리를 불러오지 못했어요.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  const handleClearAll = async () => {
    setClearing(true);
    setError('');
    try {
      await clearHistory();
      setItems([]);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : '삭제 중 문제가 발생했어요.');
    } finally {
      setClearing(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container">
        <Spinner label="로그인 상태를 확인하는 중..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <EmptyState
          icon="🔒"
          title="로그인 후 히스토리를 확인할 수 있어요"
          description="이메일과 비밀번호로 로그인하면, 이전에 확인한 사주 결과를 다시 볼 수 있습니다."
          action={<Button onClick={() => setLoginOpen(true)}>로그인하기</Button>}
        />
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <Spinner label="히스토리를 불러오는 중..." />
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="container">
        <EmptyState
          icon="⚠️"
          title="히스토리를 불러오지 못했어요"
          description={error}
          action={<Button onClick={() => window.location.reload()}>다시 시도</Button>}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container">
        <EmptyState
          icon="🗂️"
          title="아직 확인한 결과가 없어요"
          description="사주 정보를 입력하고 첫 결과를 확인해보세요."
          action={<Button onClick={() => navigate('/input')}>사주 보러 가기</Button>}
        />
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>내 히스토리</h2>
        <Button variant="danger" size="sm" onClick={handleClearAll} loading={clearing}>
          전체 삭제
        </Button>
      </div>

      {error && <p className="error-text" role="alert" style={{ marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((reading) => (
          <Card
            key={reading.id}
            hover
            onClick={() => { setReading(reading); navigate('/result'); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') { setReading(reading); navigate('/result'); } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <span className="badge" style={{ marginBottom: 6 }}>{MODE_LABEL[reading.mode]}</span>
                <h3 style={{ fontSize: '1rem', margin: '4px 0' }}>{reading.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', margin: 0 }}>{reading.summary}</p>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '.78rem', whiteSpace: 'nowrap' }}>
                {new Date(reading.createdAt).toLocaleString('ko-KR')}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
