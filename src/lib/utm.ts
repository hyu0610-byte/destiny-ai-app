const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const STORAGE_KEY = 'destiny-ai:utm';

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/**
 * 최초 진입 시 URL의 UTM 파라미터를 읽어 세션 동안 기억해 둔다.
 * 사용자가 /input, /result 등 다른 페이지로 이동해도(=UTM 파라미터가 더 이상 URL에
 * 없어도) 같은 세션이라면 최초 유입 채널을 이벤트에 계속 포함시키기 위함이다.
 */
export function captureUtmParams(): UtmParams {
  const fromUrl: UtmParams = {};
  const params = new URLSearchParams(window.location.search);
  let hasAny = false;
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      fromUrl[key] = value;
      hasAny = true;
    }
  }

  if (hasAny) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
    return fromUrl;
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UtmParams) : {};
  } catch {
    return {};
  }
}
