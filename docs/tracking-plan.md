# Tracking Plan (미션 9-1)

[지표 설계](./metrics-design.md)에서 정의한 지표를 계산하기 위해 필요한 이벤트 로그를 정의한다. 모든 이벤트는 **Amplitude**로 전송하며, 페이지 진입은 **Google Analytics 4**에서도 자동/수동으로 별도 수집한다 (유입 경로 분석용).

## 공통 원칙

- 이벤트명은 `동사_과거형` 또는 `명사_동사` 스네이크 케이스로 통일한다 (예: `saju_input_submitted`).
- 개인정보(이메일 원문, 생년월일 원본 등)는 이벤트 속성에 담지 않는다. 사용자 식별은 Amplitude의 `user_id`에 백엔드가 발급한 내부 사용자 ID(Mongo `_id`)만 사용한다.
- 모든 이벤트는 공통 속성으로 `mode_param`(해당 없으면 생략)과 `platform: 'web'`을 가질 수 있다.

## 이벤트 목록

| # | 이벤트명 | 발생 시점 | 관련 지표 | 주요 속성(Property) |
|---|---|---|---|---|
| 1 | `page_view` | 주요 페이지(`/`, `/input`, `/modes`, `/result`, `/history`) 진입 시 | 방문자 수, 유입 경로 | `path`(string), `referrer`(string), `utm_source`/`utm_medium`/`utm_campaign`(string, 있는 경우) |
| 2 | `cta_click` | 홈 히어로의 "운명 확인하기" 버튼 클릭 | 유입 → 행동 전환 시작점 | `location: "hero"` |
| 3 | `saju_input_submitted` | 정보 입력 폼(`/input`) 제출 성공(유효성 검증 통과) | 사주 결과 도달률(퍼널 1단계) | `gender`, `is_lunar`(boolean), `time_unknown`(boolean) |
| 4 | `mode_selected` | 해석 모드 카드 클릭 | 사주 결과 도달률(퍼널 2단계), 모드별 선택 비율 | `mode`("traditional"\|"daily"\|"tarot"), `time_unknown`(boolean) |
| 5 | `result_viewed` | AI 해석 성공 → 결과 화면 도달 | 사주 결과 도달률(퍼널 3단계, 핵심 지표) | `mode`, `dominant_element` |
| 6 | `interpret_failed` | AI 해석 요청 실패(네트워크 오류, 서버 오류 등) | 핵심 기능 실패율(퍼널 이탈 원인 분석) | `mode`, `error_message` |
| 7 | `signup_completed` | 회원가입 성공 | 회원가입 전환율 | 없음(식별은 `user_id`로) |
| 8 | `login_completed` | 로그인 성공 | 재방문/재로그인 추적 | 없음 |

최소 요구사항(5개) 대비 8개 이벤트로, 핵심 퍼널(입력→모드선택→결과)과 실패 케이스(`interpret_failed`)까지 포함해 설계했다.

## User Property

| Property | 설명 | 설정 시점 |
|---|---|---|
| `user_id` | Amplitude 사용자 식별자 = 백엔드 User `_id` | 로그인/회원가입 성공 시 `identify` |
| `signup_date` | 최초 가입일 | 회원가입 성공 시 1회 설정 |

## 퍼널 정의 (핵심 지표 2 계산용)

```
page_view(path=/input) → saju_input_submitted → mode_selected → result_viewed
```

이 퍼널을 Amplitude Funnel Analysis에서 구성하면 "정보 입력 시작 → 결과 확인"까지 단계별 이탈률을 확인할 수 있다.

## 구현 위치 (코드 레퍼런스)

| 이벤트 | 구현 파일 |
|---|---|
| `page_view` | `src/lib/analytics.ts`의 `trackPageView` — 각 페이지 컴포넌트 최상단 `useEffect` |
| `cta_click` | `src/pages/HomePage.tsx` |
| `saju_input_submitted` | `src/pages/InputPage.tsx` (폼 제출 핸들러) |
| `mode_selected` | `src/pages/ModeSelectPage.tsx` (`runGeneration` 호출 시작 시점) |
| `result_viewed` | `src/pages/ModeSelectPage.tsx` (AI 해석 성공 후, `/result` 이동 직전) |
| `interpret_failed` | `src/pages/ModeSelectPage.tsx` (AI 해석 실패 catch 블록) |
| `signup_completed` | `src/context/AuthContext.tsx` (`register` 성공 시) |
| `login_completed` | `src/context/AuthContext.tsx` (`login` 성공 시) |
