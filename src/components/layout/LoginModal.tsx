import { useState, type FormEvent } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }
    login(trimmed);
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="간편 로그인">
      <p style={{ color: 'var(--text-muted)', fontSize: '.9rem' }}>
        실제 비밀번호 없이, 이메일만으로 로그인 상태를 시뮬레이션합니다. 로그인하면 사주 결과를 히스토리에 저장할 수 있어요.
      </p>
      <form onSubmit={handleSubmit}>
        <Input
          label="이메일"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
        />
        <Button type="submit" block>로그인</Button>
      </form>
    </Modal>
  );
}
