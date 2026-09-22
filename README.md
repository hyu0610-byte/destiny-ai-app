# Destiny AI (프론트엔드)

정확한 사주 8글자 계산 엔진과 해석 콘텐츠를 제공하는 React 기반 프론트엔드입니다. 회원가입/로그인과 사주 결과 히스토리는 별도 백엔드 API([destiny-ai-api](https://github.com/hyu0610-byte/destiny-ai-api))와 연동됩니다.

- 배포: https://destiny-ai-app.vercel.app
- 백엔드 API: https://destiny-ai-api.onrender.com

## 기술 스택

- React 19 + TypeScript + Vite
- React Router (화면 라우팅)
- Context API (`AuthContext`, `SajuFlowContext`)로 상태 관리
- 순수 JS 사주 계산 엔진(`src/lib/sajuUtils.ts`) — 서버 없이 브라우저에서 직접 계산
- fetch 기반 API 클라이언트(`src/lib/apiClient.ts`)로 백엔드 연동

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # VITE_API_URL을 로컬 백엔드 주소로 설정
npm run dev
```

백엔드([destiny-ai-api](https://github.com/hyu0610-byte/destiny-ai-api))도 함께 로컬에서 실행되어 있어야 로그인/히스토리 기능이 동작합니다.

## 환경변수

| 변수 | 설명 |
| --- | --- |
| `VITE_API_URL` | 백엔드 API 주소. 로컬은 `http://localhost:4000`, 배포는 `https://destiny-ai-api.onrender.com` |

## 화면 흐름

```
홈 → 정보 입력 → 해석 모드 선택 → 결과 확인
                                    ↕
                              히스토리(로그인 필요)
```

- **정보 입력 → 계산**: 생년월일시·출생지를 입력하면 브라우저에서 바로 사주 8글자를 계산합니다. 출생시간을 모르면 정밀 사주(전통 사주) 모드가 제한됩니다.
- **해석 모드**: 전통 사주 / 오늘의 운세 / MZ 타로마스터 중 선택. 계산된 원국(사주 8글자)을 백엔드로 보내면 백엔드가 OpenAI API를 호출해 실제 AI 해석을 생성합니다 — AI는 원국을 재계산하지 않고 해석만 담당합니다 (미션 8, [destiny-ai-api README](https://github.com/hyu0610-byte/destiny-ai-api#readme-고도화-기능-openai-api-연동-미션-8) 참고).
- **히스토리**: 로그인한 사용자만 결과를 서버에 저장하고 다시 조회할 수 있습니다. 백엔드 API(JWT 인증) 연동.

## 백엔드 연동 관련

- 로그인 성공 시 발급된 JWT를 `localStorage`에 저장하고, 이후 요청에 `Authorization: Bearer <token>` 헤더로 사용합니다.
- 비로그인 상태에서도 계산·해석 결과는 확인할 수 있지만, 서버에는 저장되지 않습니다.
- 네트워크 오류/인증 만료 등은 각 화면에서 로딩·에러·빈 상태 UI로 안내합니다.
- AI 해석 요청이 실패하면(네트워크 오류, OpenAI 응답 실패, 레이트리밋 등) 결과 화면으로 넘어가지 않고 에러 메시지와 **다시 시도** 버튼을 보여줍니다.

백엔드 API 명세는 [destiny-ai-api README](https://github.com/hyu0610-byte/destiny-ai-api#readme)를 참고하세요.
