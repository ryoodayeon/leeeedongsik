# 배포 가이드

## 현재 프로젝트 구조

이 프로젝트는 **프론트엔드와 백엔드가 함께 있는 구조**입니다:
- `server.js`가 `index.html`을 서빙하고 API도 제공
- API는 `/api` 경로로 제공됨

## 배포 방법

### 방법 1: 서버 전체 배포 (권장) ✅

**장점**: 간단하고, 프론트엔드와 백엔드가 같은 도메인에서 작동

**배포 서비스**:
- **Railway** (추천): https://railway.app
  - GitHub 연결 후 자동 배포
  - 무료 플랜 제공
  - SQLite 지원
  
- **Render**: https://render.com
  - GitHub 연결 후 자동 배포
  - 무료 플랜 제공
  
- **Heroku**: https://heroku.com
  - 유료 플랜만 제공 (2022년 이후)

**배포 절차**:
1. GitHub에 코드 푸시
2. Railway/Render에 GitHub 저장소 연결
3. 배포 완료 후 도메인 연결
4. 끝! (API URL 자동 설정됨)

**도메인 연결**:
- 배포 서비스에서 도메인 설정
- 예: `yourdomain.com` → 서버에 연결
- `https://yourdomain.com`으로 접근 가능

### 방법 2: 프론트엔드와 백엔드 분리

**프론트엔드**: GitHub Pages / Netlify / Vercel
**백엔드**: Railway / Render / Heroku

**필요한 작업**:
1. `js/app.js`의 `API_BASE_URL`을 백엔드 서버 URL로 수정
2. 프론트엔드와 백엔드를 각각 배포
3. CORS 설정 확인

## 현재 설정

- **개발 환경**: `localhost` 또는 `127.0.0.1` → `http://localhost:3000/api` 사용
- **프로덕션 환경**: 다른 호스트 → 현재 호스트의 `/api` 사용

## 도메인 구매 후 배포 예시

1. **도메인 구매**: 예) `leeeedongsik.com`
2. **Railway에 배포**:
   - GitHub 저장소 연결
   - 자동 배포
   - Railway에서 제공하는 URL: `https://your-app.railway.app`
3. **도메인 연결**:
   - Railway 설정에서 `leeeedongsik.com` 연결
   - DNS 설정 (Railway가 안내)
4. **완료!**
   - `https://leeeedongsik.com` 접근 가능
   - API는 자동으로 `https://leeeedongsik.com/api` 사용

## 주의사항

- **SQLite 데이터베이스**: 배포 서비스에서 파일 시스템이 임시일 수 있음
  - Railway, Render는 파일이 유지됨
  - 필요시 PostgreSQL 등으로 변경 고려
  
- **환경 변수**: 필요시 `.env` 파일 사용
  - `PORT`: 서버 포트 (자동 설정됨)
  
- **CORS**: 현재 모든 origin 허용 (개발용)
  - 프로덕션에서는 특정 도메인만 허용하도록 변경 권장



