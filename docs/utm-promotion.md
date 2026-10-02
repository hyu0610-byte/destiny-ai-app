# UTM 파라미터 & 채널 홍보 (미션 9-1)

## UTM 설계 규칙

| 파라미터 | 의미 | 값 규칙 |
|---|---|---|
| `utm_source` | 유입 채널(플랫폼) | `kakao`, `naver_blog`, `instagram` 등 소문자 스네이크 케이스 |
| `utm_medium` | 채널 유형 | `social`, `blog`, `messenger` |
| `utm_campaign` | 캠페인명 | `mvp_launch` (미션 9 홍보 캠페인 공통) |

## 채널별 링크

| # | 채널 | 링크 |
|---|---|---|
| 1 | 카카오톡(단체방/오픈채팅) | `https://destiny-ai-app.vercel.app/?utm_source=kakao&utm_medium=messenger&utm_campaign=mvp_launch` |
| 2 | 네이버 블로그 | `https://destiny-ai-app.vercel.app/?utm_source=naver_blog&utm_medium=blog&utm_campaign=mvp_launch` |
| 3 | 인스타그램 | `https://destiny-ai-app.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=mvp_launch` |

이 링크들로 방문하면 [Tracking Plan](./tracking-plan.md)의 `page_view` 이벤트에 `utm_source`/`utm_medium`/`utm_campaign`이 속성으로 함께 기록되고, 세션 내내(다른 페이지로 이동해도) 유지되어 Amplitude에서 **채널별 전환 퍼널 비교**가 가능하다 (예: "카카오로 들어온 사람 vs 인스타로 들어온 사람의 결과 도달률 차이").

## 홍보 문구 (초안)

### 1. 카카오톡
> 🔮 생년월일만 입력하면 AI가 바로 사주를 풀이해주는 서비스 만들어봤어요 — Destiny AI
> 출생시간 몰라도 오늘의 운세/타로로 바로 볼 수 있어요, 한번 해보세요 👉 [링크]

### 2. 네이버 블로그
> 제목: "AI가 사주를 봐준다고? 직접 만들어본 Destiny AI 후기"
> 본문: 표준만세력 기반으로 사주 8글자를 정확히 계산하고, 그 위에 AI가 전통 사주/오늘의 운세/MZ 타로 3가지 스타일로 해석해주는 웹서비스를 만들었습니다. 계산은 엔진이, 해석은 AI가 — 믿을 수 있는 사주 서비스를 목표로 만들었어요. [링크]

### 3. 인스타그램
> 스토리/피드 문구: "내 사주, AI가 풀어드립니다 ✨ 링크 타고 들어가서 무료로 확인해보세요"
> 해시태그: #사주 #AI사주 #타로 #MZ타로 #Destiny_AI

## 성과 확인 방법

Amplitude → Event Segmentation(또는 Charts)에서 `page_view` 이벤트를 `utm_source` 속성으로 그룹핑하면 채널별 유입량을 비교할 수 있다. GA4는 **획득(Acquisition) → 트래픽 획득** 리포트에서 세션 소스/매체 기준으로 동일하게 확인 가능하다.
