# 02. 기술 스택

## 설계 원칙
1. **코드 공유 극대화**: 웹과 iOS/Android가 타입, 검증 스키마, API 클라이언트, 비즈니스 로직을 공유한다.
2. **소규모 팀 친화**: 직접 운영할 인프라를 최소화하고 관리형 서비스를 쓴다.
3. **신뢰·안전 우선**: 인증, 모더레이션, 위치 프라이버시를 처음부터 설계에 넣는다.

## 전체 구조

```
jojo/ (Turborepo + pnpm monorepo)
├── apps/
│   ├── web/        Next.js 16 (App Router) → Vercel
│   ├── mobile/     Expo (React Native) + Expo Router → EAS Build → App Store / Play Store
│   └── admin/      (Phase 2) 모더레이션 콘솔 — 별도 Next.js 앱 또는 web의 /admin 라우트
├── packages/
│   ├── shared/     zod 스키마, 도메인 타입, 상수 (프롬프트 목록, 신고 사유 등)  ✅
│   ├── api/        (예정) 타입 세이프 API 클라이언트 + TanStack Query 훅 (웹/앱 공용)
│   └── ui-tokens/  (예정) 색상·타이포·간격 디자인 토큰 (Tailwind/NativeWind 공용)
└── supabase/       Supabase CLI 설정, SQL 마이그레이션 (RLS 정책 포함), Edge Functions  ✅
```

## 레이어별 선택

| 영역 | 선택 | 이유 |
|---|---|---|
| 모노레포 | **Turborepo + pnpm** | Vercel 네이티브 지원, 원격 캐시, Expo와의 호환성 검증됨 |
| 웹 | **Next.js 16 App Router**, TypeScript, Tailwind CSS v4, shadcn/ui | Vercel 최적화. 랜딩(SEO)과 웹앱을 한 프로젝트에서 운영 |
| 모바일 | **Expo (최신 SDK)** + Expo Router, NativeWind, Reanimated + Gesture Handler | React/TS 지식을 웹과 공유. 스와이프 카드를 60fps로 구현. EAS Update로 심사 없이 JS 핫픽스 |
| 상태/데이터 | TanStack Query + Zustand | 서버 상태와 로컬 상태 분리, 웹·앱 동일 패턴 |
| 백엔드 (DB) | **Supabase Postgres + PostGIS** | 거리 기반 검색, RLS로 행 단위 보안, 관계형 데이터(매칭·차단·신고)에 적합 |
| 인증 | Supabase Auth (휴대폰 OTP, Apple, Google, Kakao) | Apple 로그인은 iOS 심사상 사실상 필수, 국내는 카카오 |
| 서버 로직 | Next.js Route Handlers (Vercel Fluid Compute) + Supabase Edge Functions | 추천 큐 생성, 결제 웹훅, 모더레이션 파이프라인 |
| 백그라운드 작업 | Vercel Cron + Vercel Queues (또는 Supabase pg_cron) | 일일 큐 생성, 휴면 계정 숨김, 갱신 알림 |
| 실시간 채팅 | **Supabase Realtime** (MVP) → 규모가 커지면 Stream Chat 검토 | 별도 인프라 없이 시작. 메시지는 Postgres에 저장하고 RLS 적용 |
| 파일 저장 | Supabase Storage (private bucket + signed URL) + 이미지 변환 | 프로필 사진 원본은 비공개, 리사이즈본만 서빙 |
| 얼굴 인증 | **AWS Rekognition Face Liveness** + CompareFaces | 셀피 라이브니스와 프로필 사진 대조. 대안: FaceTec, Persona |
| 본인인증 (KR) | **PortOne 본인인증 (PASS/NICE)** | 성인 확인, 1인 1계정 (CI 값 기반 중복 가입 차단) |
| 콘텐츠 모더레이션 | 이미지: AWS Rekognition Moderation / 텍스트: **Vercel AI Gateway** 경유 LLM 분류 | 음란물·폭력 이미지 차단, 스캠 메시지 패턴 감지 |
| 결제 (앱) | **RevenueCat** (StoreKit 2 / Google Play Billing) | 구독 상태 단일화, 갱신·해지 웹훅, 영수증 검증 |
| 결제 (웹) | Stripe Billing (글로벌) / PortOne + 토스페이먼츠 (국내) | RevenueCat과 웹 결제 연동, 비례 환불을 직접 제어 |
| 푸시 | Expo Notifications (APNs/FCM) | 매칭·메시지 알림 |
| 이메일 | Resend + React Email | 영수증, 갱신 예정 알림, 정지/항소 결과 통보 |
| 분석 | PostHog | 퍼널(가입 → 인증 → 매칭 → 대화 → 만남), 기능 플래그, A/B 테스트 |
| 에러 모니터링 | Sentry (web + React Native) | |
| 테스트 | Vitest (단위), Playwright (웹 E2E), Maestro (모바일 E2E) | |
| CI/CD | GitHub Actions (lint/typecheck/test) + Vercel (웹 프리뷰/프로덕션) + EAS Build/Submit | PR마다 웹 프리뷰 URL과 Expo 프리뷰 빌드 |
| i18n | next-intl (웹) / i18next (앱), 공용 메시지 파일 | 한국어 우선, 영어로 글로벌 확장 |

## 핵심 데이터 모델 (초안)

```
users              id, phone, ci_hash(본인인증), status(active/limited/suspended), created_at
profiles           user_id, display_name, birthdate, gender, bio, job, school, height,
                   location (geography, 약 1km 퍼징), last_active_at, verified_at
photos             id, user_id, storage_path, order, moderation_status, face_match_score
prompts            user_id, prompt_key, answer               -- Hinge식 질문 답변
preferences        user_id, age_min/max, distance_km, genders[], intent(진지/캐주얼/친구)
daily_queues       user_id, date, candidate_ids[], reasons jsonb  -- "왜 추천됐나"
swipes             swiper_id, target_id, action(like/pass/superlike), created_at
matches            id, user_a, user_b, created_at, closed_at, closed_reason
messages           id, match_id, sender_id, body, media_path, risk_score, created_at
blocks             blocker_id, blocked_id
reports            id, reporter_id, target_id, reason, evidence(message_id/photo_id), status
moderation_actions id, user_id, strike_level, reason, evidence, expires_at, reviewer_id
appeals            id, action_id, user_message, status, decided_at, decision_note
subscriptions      user_id, provider(apple/google/stripe/portone), product, status,
                   current_period_end, will_renew
```

## 보안 · 프라이버시 체크리스트
- **위치 퍼징**: 정확한 좌표는 저장하지 않고 약 1km 격자로 반올림, 거리는 "3km 이내"처럼 구간으로만 표시 (삼각측량으로 위치를 추적하는 공격 방지).
- **RLS 기본 거부**: 매칭된 상대에게만 메시지 접근 허용, 차단된 상대는 모든 조회에서 제외.
- **사진 비공개 버킷**: 짧은 만료의 signed URL만 발급하고 EXIF는 제거.
- **민감정보 최소 보관**: 본인인증 CI는 해시만 저장. 라이브니스 원본 영상은 저장하지 않음.
- **계정 삭제**: 앱 안에서 바로 삭제 가능해야 함 (Apple 심사 5.1.1(v)). 삭제할 때 구독 해지도 함께 안내.

## 법·정책 준비 사항 (국내 출시 기준)
- 위치기반서비스사업자 신고 (방통위, 위치정보법)
- 통신판매업 신고, 전자상거래법상 청약철회·환불 고지
- 개인정보처리방침, 민감정보 별도 동의 (얼굴 인증 데이터)
- 청소년 이용 차단 (만 19세 이상 성인 인증)
- App Store 가이드라인 1.2 (UGC 앱: 신고·차단·필터링 필수), Google Play 데이팅앱 정책
