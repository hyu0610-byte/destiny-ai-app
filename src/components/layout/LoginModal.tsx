import { useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ApiRequestError } from '../../lib/auth';

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(trimmed, password);
      } else {
        await register(trimmed, password);
      }
      handleClose();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError('요청 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={mode === 'login' ? '로그인' : '회원가입'}>
      <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>
        {mode === 'login'
          ? '로그인하면 사주 결과를 히스토리에 저장하고 다시 확인할 수 있어요.'
          : '이메일과 비밀번호만으로 간단하게 가입할 수 있어요.'}
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="이메일"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          label="비밀번호"
          type="password"
          placeholder="6자 이상"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          error={error}
        />
        <Button type="submit" block loading={submitting}>
          {mode === 'login' ? '로그인' : '회원가입'}
        </Button>
      </form>
      <button
        type="button"
        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
        style={{
          background: 'none', border: 'none', color: 'var(--accent)', fontSize: '.85rem',
          marginTop: 14, cursor: 'pointer', textDecoration: 'underline', display: 'block', marginInline: 'auto',
        }}
      >
        {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
      </button>
    </Modal>
  );
}
