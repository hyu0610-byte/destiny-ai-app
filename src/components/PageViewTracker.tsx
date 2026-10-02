import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';

/** 라우트가 바뀔 때마다 Amplitude/GA4로 page_view를 전송한다 (SPA라 자동 수집이 안 됨) */
export default function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return null;
}
