import * as amplitude from '@amplitude/analytics-browser';
import { captureUtmParams } from './utm';

const AMPLITUDE_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY;
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let initialized = false;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

function initGA() {
  if (!GA_ID) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());
  // SPA라 자동 page_view는 끄고, 라우트가 바뀔 때마다 trackPageView에서 직접 보낸다.
  window.gtag('config', GA_ID, { send_page_view: false });
}

/** 앱 시작 시 1회 호출. Amplitude + GA4 초기화 */
export function initAnalytics() {
  if (initialized) return;
  initialized = true;

  if (AMPLITUDE_KEY) {
    amplitude.init(AMPLITUDE_KEY, {
      defaultTracking: {
        pageViews: false, // page_view는 trackPageView에서 직접 전송 (UTM 등 커스텀 속성 포함)
        sessions: true,
        formInteractions: false,
        fileDownloads: false,
      },
    });
  }

  initGA();
}

function sendToAmplitude(eventName: string, properties?: Record<string, unknown>) {
  if (!AMPLITUDE_KEY) return;
  amplitude.track(eventName, properties);
}

function sendToGA(eventName: string, properties?: Record<string, unknown>) {
  if (!GA_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, properties ?? {});
}

/** 공통 이벤트 전송 — Amplitude로만 보낸다 (Tracking Plan의 커스텀 이벤트용) */
export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  sendToAmplitude(eventName, properties);
}

/** 페이지 진입 — Amplitude(page_view)와 GA4(page_view) 양쪽 모두로 전송 */
export function trackPageView(path: string) {
  const utm = captureUtmParams();
  const properties = {
    path,
    referrer: document.referrer || undefined,
    ...utm,
  };
  sendToAmplitude('page_view', properties);
  sendToGA('page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    ...utm,
  });
}

/** 로그인/회원가입 성공 시 사용자 식별 */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (AMPLITUDE_KEY) {
    amplitude.setUserId(userId);
    if (properties) {
      const identify = new amplitude.Identify();
      Object.entries(properties).forEach(([key, value]) => {
        identify.set(key, value as string | number | boolean);
      });
      amplitude.identify(identify);
    }
  }
  if (GA_ID && typeof window.gtag === 'function') {
    window.gtag('set', 'user_id', userId);
  }
}

/** 로그아웃 시 사용자 식별 해제 */
export function resetUser() {
  if (AMPLITUDE_KEY) amplitude.reset();
}
