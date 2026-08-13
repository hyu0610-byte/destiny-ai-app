import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import LoginModal from './LoginModal';

export default function Header() {
  const { user, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="Destiny AI 홈으로 이동">
          <span className="logo-orb" aria-hidden="true"></span>
          <span>Destiny AI</span>
        </Link>

        <nav className="main-nav" aria-label="주요 메뉴">
          <ul>
            <li><NavLink to="/" end>홈</NavLink></li>
            <li><NavLink to="/input">사주 보기</NavLink></li>
            <li><NavLink to="/history">히스토리</NavLink></li>
          </ul>
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="user-chip">{user.nickname}님</span>
              <Button variant="ghost" size="sm" onClick={logout}>로그아웃</Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setLoginOpen(true)}>로그인</Button>
          )}
        </div>
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
